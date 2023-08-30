import Koa from 'koa'
import Router from 'koa-router'
import { getLogger } from '../logger'
import { SplitRequest } from '../types/router'
import { addSplitJob } from './queue/splitQueue'
import { newTaskId } from '../util/idUtil'
import bodyParser from 'koa-bodyparser'

const logger = getLogger('router')
export async function startRouter() {
  const app = new Koa()
  const router = new Router()
  router.post('/api/split', handleSplit)

  app.use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000);
  logger.info('start koa server')
}

async function handleSplit(ctx: Koa.Context) {
  const request = ctx.request.body as SplitRequest
  logger.info('handle split request %o', request)
  writeResponse(ctx, {
    data: 'success'
  })
  addSplitJob({
    taskId: newTaskId(),
    ...request
  })
}

function writeResponse(ctx: Koa.Context, data: object) {
  ctx.status = 200
  ctx.headers['Content-Type'] = 'application/json'
  ctx.body = JSON.stringify(data)
}
