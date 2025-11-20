import { z } from 'zod';

/**
 * Enums e tipos base
 */
export const AnalysisModeSchema = z.enum([
  'semantic_summary',
  'root_cause',
  'anomaly_detection',
  'correlation_analysis',
  'recommendation',
  'risk_scoring',
  'mixed'
]);

export const LanguageSchema = z.enum(['pt-BR', 'en-US', 'es-ES']);

export const GranularitySchema = z.enum(['minute', 'hour', 'day', 'week', 'month']);

export const DirectionSchema = z.enum(['positive', 'negative', 'neutral']);

export const SeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const CorrelationTypeSchema = z.enum(['positive', 'negative', 'nonlinear', 'none']);

export const InsightCategorySchema = z.enum([
  'performance',
  'risk',
  'opportunity',
  'quality',
  'capacity',
  'financial'
]);

export const ActionTypeSchema = z.enum([
  'notification',
  'schedule_review',
  'threshold_adjustment',
  'resource_reallocation',
  'alert_escalation',
  'custom'
]);

export const UrgencySchema = z.enum(['low', 'medium', 'high', 'immediate']);

export const UserRoleSchema = z.enum(['EXECUTIVE', 'MANAGER', 'SUPERVISOR', 'ANALYST']);

export const DocumentTypeSchema = z.enum(['note', 'email_excerpt', 'incident_description', 'generic']);

export const ColumnRoleSchema = z.enum(['METRIC', 'DIMENSION', 'TIMESTAMP', 'CATEGORY']);

/**
 * Time Window
 */
export const TimeWindowSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  granularity: GranularitySchema.optional()
});

/**
 * User Context
 */
export const UserContextSchema = z.object({
  user_id: z.string().optional(),
  role: UserRoleSchema.optional(),
  department: z.string().optional(),
  permissions: z.array(z.string()).optional()
});

/**
 * Context
 */
export const ContextSchema = z.object({
  domain: z.string(),
  operation_id: z.string().optional(),
  user_context: UserContextSchema.optional(),
  business_metadata: z.record(z.any()).optional()
});

/**
 * FSB Features
 */
export const FSBFeaturesSchema = z.object({
  schema_version: z.string().default('1.0.0'),
  features: z.record(z.union([z.number(), z.string(), z.boolean(), z.null()]))
});

/**
 * Analytic Data - Column
 */
export const ColumnSchema = z.object({
  name: z.string(),
  type: z.string(),
  role: ColumnRoleSchema.optional()
});

/**
 * Analytic Data - Table
 */
export const TableSchema = z.object({
  name: z.string(),
  primary_keys: z.array(z.string()).optional(),
  columns: z.array(ColumnSchema),
  rows: z.array(z.record(z.any()))
});

/**
 * Analytic Data
 */
export const AnalyticDataSchema = z.object({
  schema_version: z.string().default('1.0.0'),
  tables: z.array(TableSchema)
});

/**
 * Raw Document
 */
export const RawDocumentSchema = z.object({
  doc_id: z.string(),
  type: DocumentTypeSchema,
  content: z.string()
});

/**
 * Constraints
 */
export const ConstraintsSchema = z.object({
  max_tokens: z.number().optional(),
  max_insights: z.number().optional(),
  max_depth: z.number().optional(),
  disable_llm: z.boolean().optional()
});

/**
 * Return Options
 */
export const ReturnOptionsSchema = z.object({
  include_raw_llm_output: z.boolean().default(false),
  include_debug_info: z.boolean().default(false),
  include_intermediate_scores: z.boolean().default(false)
});

/**
 * Trace
 */
export const TraceSchema = z.object({
  trace_id: z.string().optional(),
  span_id: z.string().optional(),
  parent_span_id: z.string().optional()
});

/**
 * Request Schema - POST /v1/analyze
 */
export const AnalyzeRequestSchema = z.object({
  request_id: z.string(),
  tenant_id: z.string().optional(),
  use_case: z.string(),
  mode: AnalysisModeSchema,
  language: LanguageSchema,
  time_window: TimeWindowSchema.optional(),
  context: ContextSchema,
  fsb_features: FSBFeaturesSchema.optional(),
  analytic_data: AnalyticDataSchema.optional(),
  raw_documents: z.array(RawDocumentSchema).optional(),
  prompt: z.string(),
  constraints: ConstraintsSchema.optional(),
  return_options: ReturnOptionsSchema.optional(),
  trace: TraceSchema.optional()
});

/**
 * Response Schemas
 */

// Driver
export const DriverSchema = z.object({
  name: z.string(),
  direction: DirectionSchema,
  impact_score: z.number().min(0).max(1),
  explanation: z.string()
});

// Anomaly
export const AnomalySchema = z.object({
  id: z.string(),
  metric: z.string(),
  severity: SeveritySchema,
  anomaly_score: z.number().min(0).max(1),
  description: z.string(),
  time_range: z.object({
    from: z.string(),
    to: z.string()
  }).optional()
});

// Correlation
export const CorrelationSchema = z.object({
  metric_x: z.string(),
  metric_y: z.string(),
  correlation_type: CorrelationTypeSchema,
  correlation_score: z.number().min(0).max(1),
  explanation: z.string()
});

// Insight
export const InsightSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: InsightCategorySchema,
  priority: SeveritySchema,
  confidence: z.number().min(0).max(1),
  related_metrics: z.array(z.string()).optional()
});

// Action
export const ActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  action_type: ActionTypeSchema,
  target_system: z.string().optional(),
  expected_impact: z.string().optional(),
  estimated_impact_score: z.number().min(0).max(1).optional(),
  urgency: UrgencySchema
});

// Risk
export const RiskSchema = z.object({
  overall_risk_score: z.number().min(0).max(1),
  risk_level: SeveritySchema,
  top_risks: z.array(z.string())
});

// Meta
export const MetaSchema = z.object({
  duration_ms: z.number(),
  llm_model_used: z.string().optional(),
  llm_tokens_input: z.number().optional(),
  llm_tokens_output: z.number().optional(),
  timestamp: z.string().datetime(),
  trace_id: z.string().optional(),
  warnings: z.array(z.string()).optional()
});

// Debug
export const DebugSchema = z.object({
  raw_llm_output: z.string().optional(),
  feature_snapshot: z.record(z.any()).optional(),
  rules_fired: z.array(z.string()).optional()
});

/**
 * Analyze Response Schema
 */
export const AnalyzeResponseSchema = z.object({
  request_id: z.string(),
  mode: AnalysisModeSchema,
  semantic_context: z.string(),
  key_highlights: z.array(z.string()).optional(),
  drivers: z.array(DriverSchema).optional(),
  anomalies: z.array(AnomalySchema).optional(),
  correlations: z.array(CorrelationSchema).optional(),
  insights: z.array(InsightSchema),
  actions: z.array(ActionSchema),
  risk: RiskSchema.optional(),
  meta: MetaSchema,
  debug: DebugSchema.optional()
});

/**
 * Error Response Schema
 */
export const ErrorResponseSchema = z.object({
  request_id: z.string().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
    retryable: z.boolean()
  })
});

/**
 * Types (exportados para uso em TypeScript)
 */
export type AnalysisMode = z.infer<typeof AnalysisModeSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Granularity = z.infer<typeof GranularitySchema>;
export type Direction = z.infer<typeof DirectionSchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type CorrelationType = z.infer<typeof CorrelationTypeSchema>;
export type InsightCategory = z.infer<typeof InsightCategorySchema>;
export type ActionType = z.infer<typeof ActionTypeSchema>;
export type Urgency = z.infer<typeof UrgencySchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type ColumnRole = z.infer<typeof ColumnRoleSchema>;

export type TimeWindow = z.infer<typeof TimeWindowSchema>;
export type UserContext = z.infer<typeof UserContextSchema>;
export type Context = z.infer<typeof ContextSchema>;
export type FSBFeatures = z.infer<typeof FSBFeaturesSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Table = z.infer<typeof TableSchema>;
export type AnalyticData = z.infer<typeof AnalyticDataSchema>;
export type RawDocument = z.infer<typeof RawDocumentSchema>;
export type Constraints = z.infer<typeof ConstraintsSchema>;
export type ReturnOptions = z.infer<typeof ReturnOptionsSchema>;
export type Trace = z.infer<typeof TraceSchema>;

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type Driver = z.infer<typeof DriverSchema>;
export type Anomaly = z.infer<typeof AnomalySchema>;
export type Correlation = z.infer<typeof CorrelationSchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type Debug = z.infer<typeof DebugSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
