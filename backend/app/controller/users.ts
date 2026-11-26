import { Controller } from 'egg';
import { validationError } from '../lib/errors';

function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw validationError('账号 ID 不合法');
  }
  return id;
}

export default class UsersController extends Controller {
  public async list() {
    const all = await this.ctx.service.users.list();
    // ProTableAsync 固定传 currPageNo / pageSize，列表接口必须按它分页
    const currPageNo = Math.max(1, Number(this.ctx.query.currPageNo) || 1);
    const pageSize = Math.min(
      1000,
      Math.max(1, Number(this.ctx.query.pageSize) || 20),
    );
    const start = (currPageNo - 1) * pageSize;

    this.ctx.body = {
      success: true,
      data: {
        datas: all.slice(start, start + pageSize),
        total: all.length,
      },
    };
  }

  public async create() {
    const data = await this.ctx.service.users.create(
      this.ctx.request.body as any,
    );
    this.ctx.body = { success: true, data };
  }

  public async update() {
    const id = parseId(this.ctx.params.id);
    const data = await this.ctx.service.users.update(
      id,
      this.ctx.request.body as any,
    );
    this.ctx.body = { success: true, data };
  }

  public async resetPassword() {
    const id = parseId(this.ctx.params.id);
    const { password } = this.ctx.request.body as any;
    const data = await this.ctx.service.users.resetPassword(id, password);
    this.ctx.body = { success: true, data };
  }

  public async setStatus() {
    const id = parseId(this.ctx.params.id);
    const { status } = this.ctx.request.body as any;
    const data = await this.ctx.service.users.setStatus(id, !!status);
    this.ctx.body = { success: true, data };
  }

  public async remove() {
    const id = parseId(this.ctx.params.id);
    const data = await this.ctx.service.users.remove(id);
    this.ctx.body = { success: true, data };
  }
}
