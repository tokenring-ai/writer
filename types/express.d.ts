declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';

  export interface Request extends IncomingMessage {
    body?: any;
    params: Record<string, string>;
    query: Record<string, string | string[]>;
  }

  export interface Response extends ServerResponse {
    status(code: number): this;
    send(body?: any): this;
    json(body: any): this;
  }

  export type Express = ((req: IncomingMessage, res: ServerResponse) => void) & {
    use(...handlers: any[]): void;
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void): void;
    listen(port: number, cb?: () => void): any;
  };

  interface ExpressStatic {
    (): Express;
    json(): any;
    static(root: string): any;
  }

  const express: ExpressStatic;
  export default express;
}
