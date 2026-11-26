import { Service } from 'egg';
import { miniappWechatCodeInvalid, miniappWechatUnavailable } from '../lib/errors';

interface WechatSessionResponse {
  openid?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

export default class WechatService extends Service {
  public async exchangeCode(code: string): Promise<{
    openid: string;
    unionid?: string;
  }> {
    const { appId, appSecret } = this.app.config.wechatMiniapp;
    if (!appId || !appSecret) throw miniappWechatUnavailable();

    const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
    url.searchParams.set('appid', appId);
    url.searchParams.set('secret', appSecret);
    url.searchParams.set('js_code', code);
    url.searchParams.set('grant_type', 'authorization_code');

    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    } catch (error) {
      this.ctx.logger.warn('[wechat] code exchange failed: %s', error);
      throw miniappWechatUnavailable();
    }

    if (!response.ok) {
      throw miniappWechatUnavailable();
    }

    let body: WechatSessionResponse;
    try {
      body = (await response.json()) as WechatSessionResponse;
    } catch {
      throw miniappWechatUnavailable();
    }

    if (body.errcode || !body.openid) {
      this.ctx.logger.warn('[wechat] code exchange rejected: %s', body.errmsg || body.errcode);
      throw miniappWechatCodeInvalid();
    }

    return { openid: body.openid, unionid: body.unionid };
  }
}
