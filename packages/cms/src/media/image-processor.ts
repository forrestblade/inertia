import sharp from 'sharp'
import { ok, err, ResultAsync } from 'neverthrow'
import type { Result } from 'neverthrow'
import type { CmsError } from '../schema/types.js'
import { CmsErrorCode } from '../schema/types.js'
import type { ImageSize } from './media-config.js'

export interface ProcessedImage {
  readonly name: string
  readonly buffer: Buffer
  readonly width: number
  readonly height: number
  readonly filesize: number
  readonly mimeType: string
}

export interface FocalPoint {
  readonly x: number
  readonly y: number
}

function toSharpError (e: unknown): CmsError {
  return {
    code: CmsErrorCode.INTERNAL,
    message: e instanceof Error ? e.message : 'Image processing failed'
  }
}

function buildResizeOptions (size: ImageSize, focalPoint: FocalPoint | undefined): sharp.ResizeOptions {
  const fit = size.fit ?? 'cover'

  const options: sharp.ResizeOptions = {
    width: size.width,
    height: size.height,
    fit
  }

  if (focalPoint && fit === 'cover') {
    options.position = sharp.strategy.attention
  }

  return options
}

async function applyFocalPointCrop (
  pipeline: sharp.Sharp,
  size: ImageSize,
  focalPoint: FocalPoint
): Promise<Result<sharp.Sharp, CmsError>> {
  const metaResult = await ResultAsync.fromPromise(
    pipeline.metadata(),
    toSharpError
  )
  if (metaResult.isErr()) return err(metaResult.error)

  const meta = metaResult.value
  const srcW = meta.width ?? 0
  const srcH = meta.height ?? 0

  if (srcW === 0 || srcH === 0) {
    return ok(pipeline.resize({ width: size.width, height: size.height, fit: 'cover' }))
  }

  const targetW = size.width
  const targetH = size.height
  const scaleX = targetW / srcW
  const scaleY = targetH / srcH
  const scale = Math.max(scaleX, scaleY)

  const scaledW = Math.round(srcW * scale)
  const scaledH = Math.round(srcH * scale)

  const focalX = Math.round(focalPoint.x * scaledW)
  const focalY = Math.round(focalPoint.y * scaledH)

  const left = Math.min(Math.max(focalX - Math.round(targetW / 2), 0), scaledW - targetW)
  const top = Math.min(Math.max(focalY - Math.round(targetH / 2), 0), scaledH - targetH)

  return ok(
    pipeline
      .resize({ width: scaledW, height: scaledH, fit: 'fill' })
      .extract({ left, top, width: targetW, height: targetH })
  )
}

async function processSize (
  inputBuffer: Buffer,
  size: ImageSize,
  focalPoint: FocalPoint | undefined
): Promise<Result<ProcessedImage, CmsError>> {
  const fit = size.fit ?? 'cover'
  let pipeline: sharp.Sharp

  if (focalPoint && fit === 'cover') {
    const cropResult = await applyFocalPointCrop(sharp(inputBuffer), size, focalPoint)
    if (cropResult.isErr()) return err(cropResult.error)
    pipeline = cropResult.value
  } else {
    pipeline = sharp(inputBuffer).resize(buildResizeOptions(size, undefined))
  }

  const bufferResult = await ResultAsync.fromPromise(
    pipeline.toBuffer({ resolveWithObject: true }),
    toSharpError
  )

  if (bufferResult.isErr()) return err(bufferResult.error)

  const { data: outputBuffer, info } = bufferResult.value

  return ok({
    name: size.name,
    buffer: outputBuffer,
    width: info.width,
    height: info.height,
    filesize: outputBuffer.length,
    mimeType: `image/${info.format}`
  })
}

async function processWebpVariant (
  inputBuffer: Buffer,
  size: ImageSize,
  focalPoint: FocalPoint | undefined
): Promise<Result<ProcessedImage, CmsError>> {
  const fit = size.fit ?? 'cover'
  let pipeline: sharp.Sharp

  if (focalPoint && fit === 'cover') {
    const cropResult = await applyFocalPointCrop(sharp(inputBuffer), size, focalPoint)
    if (cropResult.isErr()) return err(cropResult.error)
    pipeline = cropResult.value.webp({ quality: 80 })
  } else {
    pipeline = sharp(inputBuffer)
      .resize(buildResizeOptions(size, undefined))
      .webp({ quality: 80 })
  }

  const webpResult = await ResultAsync.fromPromise(
    pipeline.toBuffer({ resolveWithObject: true }),
    toSharpError
  )

  if (webpResult.isErr()) return err(webpResult.error)

  const { data: webpBuffer, info: webpInfo } = webpResult.value

  return ok({
    name: `${size.name}-webp`,
    buffer: webpBuffer,
    width: webpInfo.width,
    height: webpInfo.height,
    filesize: webpBuffer.length,
    mimeType: 'image/webp'
  })
}

export async function processImageSizes (
  inputBuffer: Buffer,
  sizes: readonly ImageSize[],
  formats: readonly string[] = [],
  focalPoint?: FocalPoint
): Promise<Result<readonly ProcessedImage[], CmsError>> {
  const results: ProcessedImage[] = []

  for (const size of sizes) {
    const sizeResult = await processSize(inputBuffer, size, focalPoint)
    if (sizeResult.isErr()) return err(sizeResult.error)
    results.push(sizeResult.value)

    if (formats.includes('webp')) {
      const webpResult = await processWebpVariant(inputBuffer, size, focalPoint)
      if (webpResult.isErr()) return err(webpResult.error)
      results.push(webpResult.value)
    }
  }

  return ok(results)
}
