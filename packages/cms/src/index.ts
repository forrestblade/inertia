// @valencets/cms — Schema engine, admin routes, auth, and media upload for Valence sites

export {
  CmsErrorCode,
  FieldType,
  field,
  collection,
  global,
  createCollectionRegistry,
  createGlobalRegistry
} from './schema/index.js'

export type {
  CmsError,
  FieldBaseConfig,
  FieldConfig,
  TextFieldConfig,
  TextareaFieldConfig,
  NumberFieldConfig,
  BooleanFieldConfig,
  SelectFieldConfig,
  SelectOption,
  DateFieldConfig,
  SlugFieldConfig,
  MediaFieldConfig,
  RelationFieldConfig,
  GroupFieldConfig,
  CollectionConfig,
  CollectionLabels,
  GlobalConfig,
  CollectionRegistry,
  GlobalRegistry,
  InferFieldType,
  InferFieldsType
} from './schema/index.js'

export {
  generateZodSchema,
  generatePartialSchema,
  isValidSlug,
  isValidEmail
} from './validation/index.js'

export {
  WhereOperator,
  createQueryBuilder,
  getColumnType,
  getColumnConstraints,
  generateCreateTable,
  generateCreateTableSql
} from './db/index.js'

export type {
  WhereCondition,
  WhereClause,
  OrderByClause,
  PaginatedResult,
  QueryBuilderFactory,
  CollectionQueryBuilder,
  MigrationOutput
} from './db/index.js'
