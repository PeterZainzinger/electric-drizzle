/* eslint-disable */
export const postgres2sqlite = {
  varchar: 'text',
  uuid: 'text',
  int: 'integer',
  bigint: 'integer',
} satisfies Record<string, any>;
