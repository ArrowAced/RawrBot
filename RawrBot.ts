const serverURL = "wss://sokt.meltland.dev"

type cb = (...args: any[]) => void
export class RawrBot {
    private _events: {login: cb[], post:cb[]} = {
        login: [],
        post: [],
    };
    private _username?: string;
    private _token?: string;
    private _ws?: WebSocket;
    private _posts: object[] = []
    constructor(options?: object) {

    }
    
    login(username: string, password: string) {
        this._username = username
        this._ws = new WebSocket(serverURL) 
        this._ws.addEventListener("message",(e) => {
            this._ws?.send(JSON.stringify({command: "login_pswd", username: username, password: password}))
        }, {once:true})
        this._ws.addEventListener("message",(e) => {
            this._handlepacket(JSON.parse(e.data))
        })
    }
    //todo: handle greet and token and stuff
    private _handlepacket(packet: any) {
        if (Object.hasOwn(packet, "command")) {
            switch (packet.command) {
                case("new_post"): this._posts.push(packet.data); this._events.post.forEach((f) => {f(packet.data)})
            }
        }
    }

    post(content: string, options?: {replies?: number[], attachments?: string[]}) {
        this._ws?.send(JSON.stringify({command:"post",content:content,replies: options?.replies ?? [],attachments: options?.attachments ?? []}))
    }

    get ws(): WebSocket | undefined {
        return this._ws
    }

    get posts(): object[] {
        return this._posts
    }

    on(event: "login" | "post", callback: cb) {
        this._events[event].push(callback)
    }
}