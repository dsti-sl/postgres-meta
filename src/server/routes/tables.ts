import { FastifyInstance } from 'fastify'
import { PostgresMeta } from '../../lib'
import { DEFAULT_POOL_CONFIG } from '../constants'
import { extractRequestForLogging, translateErrorToResponseCode } from '../utils'

export default async (fastify: FastifyInstance) => {
  fastify.get<{
    Headers: { pg: string }
    Querystring: {
      include_system_schemas?: string
      limit?: number
      offset?: number
    }
  }>('/', async (request, reply) => {
    const connectionString = request.headers.pg
    const includeSystemSchemas = request.query.include_system_schemas === 'true'
    const limit = request.query.limit
    const offset = request.query.offset

    const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString })
    const { data, error } = await pgMeta.tables.list({ includeSystemSchemas, limit, offset })
    await pgMeta.end()
    if (error) {
      request.log.error({ error, request: extractRequestForLogging(request) })
      reply.code(translateErrorToResponseCode(error, 500))
      return { error: error.message }
    }

    return data
  })

  fastify.get<{
    Headers: { pg: string }
    Params: {
      name: string
    }
  }>('/:name', async (request, reply) => {
    const connectionString = request.headers.pg
    const name = request.params.name

    const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString })
    const { data, error } = await pgMeta.tables.retrieve({ name, schema: 'public' })
    await pgMeta.end()
    if (error) {
      request.log.error({ error, request: extractRequestForLogging(request) })
      reply.code(404)
      return { error: error.message }
    }

    return data
  })

  // fastify.post<{
  //   Headers: { pg: string }
  //   Body: any
  // }>('/', async (request, reply) => {
  //   const connectionString = request.headers.pg

  //   const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString })
  //   const { data, error } = await pgMeta.tables.create(request.body)
  //   await pgMeta.end()
  //   if (error) {
  //     request.log.error({ error, request: extractRequestForLogging(request) })
  //     reply.code(400)
  //     return { error: error.message }
  //   }

  //   return data
  // })

  // fastify.patch<{
  //   Headers: { pg: string }
  //   Params: {
  //     id: string
  //   }
  //   Body: any
  // }>('/:id(\\d+)', async (request, reply) => {
  //   const connectionString = request.headers.pg
  //   const id = Number(request.params.id)

  //   const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString })
  //   const { data, error } = await pgMeta.tables.update(id, request.body)
  //   await pgMeta.end()
  //   if (error) {
  //     request.log.error({ error, request: extractRequestForLogging(request) })
  //     reply.code(400)
  //     if (error.message.startsWith('Cannot find')) reply.code(404)
  //     return { error: error.message }
  //   }

  //   return data
  // })

  // fastify.delete<{
  //   Headers: { pg: string }
  //   Params: {
  //     id: string
  //   }
  //   Querystring: {
  //     cascade?: string
  //   }
  // }>('/:id(\\d+)', async (request, reply) => {
  //   const connectionString = request.headers.pg
  //   const id = Number(request.params.id)
  //   const cascade = request.query.cascade === 'true'

  //   const pgMeta = new PostgresMeta({ ...DEFAULT_POOL_CONFIG, connectionString })
  //   const { data, error } = await pgMeta.tables.remove(id, { cascade })
  //   await pgMeta.end()
  //   if (error) {
  //     request.log.error({ error, request: extractRequestForLogging(request) })
  //     reply.code(400)
  //     if (error.message.startsWith('Cannot find')) reply.code(404)
  //     return { error: error.message }
  //   }

  //   return data
  // })
}
