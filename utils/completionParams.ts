export enum CompletionParamsModel {
  'gpt-3.5-turbo-0301' = 'gpt-3.5-turbo-0301',
  'gpt-3.5-turbo' = 'gpt-3.5-turbo',
  'gpt-4' = 'gpt-4',
  'gpt-4-0314' = 'gpt-4-0314',
  'gpt-4-32k' = 'gpt-4-32k',
  'gpt-4-32k-0314' = 'gpt-4-32k-0314',
}

export interface CompletionParams {
  model?: CompletionParamsModel;
}
