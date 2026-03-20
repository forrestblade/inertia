import {
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLList,
  GraphQLObjectType
} from 'graphql'
import type { GraphQLOutputType } from 'graphql'
import type {
  FieldConfig,
  NumberFieldConfig,
  SelectFieldConfig,
  MultiselectFieldConfig,
  GroupFieldConfig,
  ArrayFieldConfig,
  BlocksFieldConfig
} from '@valencets/cms'

function buildNumberType (field: NumberFieldConfig): GraphQLOutputType {
  return field.hasDecimals === true ? GraphQLFloat : GraphQLInt
}

function buildSelectType (field: SelectFieldConfig): GraphQLOutputType {
  return new GraphQLEnumType({
    name: `${field.name}_enum`,
    values: Object.fromEntries(
      field.options.map(opt => [opt.value, { value: opt.value }])
    )
  })
}

function buildMultiselectType (field: MultiselectFieldConfig): GraphQLOutputType {
  const enumType = new GraphQLEnumType({
    name: `${field.name}_enum`,
    values: Object.fromEntries(
      field.options.map(opt => [opt.value, { value: opt.value }])
    )
  })
  return new GraphQLList(enumType)
}

function buildGroupType (field: GroupFieldConfig): GraphQLOutputType {
  return new GraphQLObjectType({
    name: `${field.name}_group`,
    fields: () => Object.fromEntries(
      field.fields.map(child => [
        child.name,
        { type: fieldToGraphQLType(child) }
      ])
    )
  })
}

function buildArrayType (field: ArrayFieldConfig): GraphQLOutputType {
  const itemType = new GraphQLObjectType({
    name: `${field.name}_item`,
    fields: () => Object.fromEntries(
      field.fields.map(child => [
        child.name,
        { type: fieldToGraphQLType(child) }
      ])
    )
  })
  return new GraphQLList(itemType)
}

function buildBlocksType (field: BlocksFieldConfig): GraphQLOutputType {
  const blockTypes = field.blocks.map(block =>
    new GraphQLObjectType({
      name: `${field.name}_${block.slug}_block`,
      fields: () => Object.fromEntries(
        block.fields.map(child => [
          child.name,
          { type: fieldToGraphQLType(child) }
        ])
      )
    })
  )
  return new GraphQLList(blockTypes[0] ?? GraphQLString)
}

type FieldTypeHandler = (field: FieldConfig) => GraphQLOutputType

const FIELD_GRAPHQL_TYPE_MAP: Record<string, FieldTypeHandler> = {
  text: () => GraphQLString,
  textarea: () => GraphQLString,
  richtext: () => GraphQLString,
  number: (field) => buildNumberType(field as NumberFieldConfig),
  boolean: () => GraphQLBoolean,
  select: (field) => buildSelectType(field as SelectFieldConfig),
  multiselect: (field) => buildMultiselectType(field as MultiselectFieldConfig),
  date: () => GraphQLString,
  slug: () => GraphQLString,
  media: () => GraphQLString,
  relation: () => GraphQLString,
  group: (field) => buildGroupType(field as GroupFieldConfig),
  email: () => GraphQLString,
  url: () => GraphQLString,
  password: () => GraphQLString,
  json: () => GraphQLString,
  color: () => GraphQLString,
  array: (field) => buildArrayType(field as ArrayFieldConfig),
  blocks: (field) => buildBlocksType(field as BlocksFieldConfig)
}

export function fieldToGraphQLType (field: FieldConfig): GraphQLOutputType {
  const handler = FIELD_GRAPHQL_TYPE_MAP[field.type]
  if (handler === undefined) {
    return GraphQLString
  }
  return handler(field)
}
