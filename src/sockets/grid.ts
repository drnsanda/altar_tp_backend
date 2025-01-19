import WebSocket from 'ws';
import config from '../config';
import { verifyUserTokenService } from '../services/userService';
import { createPaymentsService, getPaymentsHTMLService } from '../services/paymentService';
import { generateGridService } from '../services/gridService';
import { ServiceError } from '../interfaces/errors';
import { IncomingMessage } from 'http';

const grid: {
  clients: number;
  _html: string;
  cue: Array<string>
} = {
  _html: "",
  clients: 0,
  cue: [] //CUE HOLDER FOR CLIENTS
}
const payments: {
  _html: string
  cue: Array<any>
} = {
  _html: "",
  cue: [] //CUE HOLDER FOR CLIENTS
}

const handleMessage = (payload: string, client: WebSocket, socket: WebSocket.Server) => {
  let task: Partial<{ code: string, data: any }> = { code: "", data: {} };
  try {
    task = JSON.parse(payload);
  } catch (error) {
    task = {};
    console.error("INVALID_FORMAT_ATTEMPT");
  }
  if (task.code === 'connect') {
    grid.clients += 1;
  }
  else if (task?.code === 'disconnect') {
    grid.clients -= 1;
  }
  else if (task?.code === 'bias') {
    grid.cue.push(task?.data);
  }
  else if (task?.code === 'execute_payment') {
    if (task?.data?.code && task?.data?.amount && task?.data?.name && task?.data?.grid) {
      let payment: any = {
        code: task?.data?.code,
        amount: task?.data?.amount,
        name: task?.data?.name,
        createdDate: new Date().getTime(),
        grid: task?.data?.grid
      }
      createPaymentsService(payment)
        .then(() => {
          broadcast(socket, JSON.stringify({ status: "updating_payments" }));
          client.send(JSON.stringify({ status: "payment_completed", message: "Payment Completed" }));
        })
        .catch(() => {
          client.send(JSON.stringify({ status: "payment_failed", message: "Failed to complete payment, please try again later" }));
        })
    }
  }
}
const broadcast = (socket: WebSocket.Server, data: string) => {
  socket.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

const startLiveGrid = (socket: WebSocket.Server) => {
  setInterval(() => {
    setTimeout(() => {
      broadcast(socket, JSON.stringify({ status: "updating_grid" }));
    }, 1000 * (config.gridRefreshTime - 1));

    let result: any = {};

    if (grid?.cue?.length > 0) {
      result = generateGridService(grid.cue.shift()?.toLowerCase());
    } else {
      result = generateGridService();
    }

    if ("error" in result) {
      console.error("Failed to generate grid");
    } else if (typeof result?.html === "string") {
      grid._html = result.html;
      broadcast(socket, JSON.stringify({
        status: "fetching_grid",
        html: grid._html,
        raw: result?.raw,
        clientsConnected: grid.clients
      }));
    }
  }, 1000 * config.gridRefreshTime);
};
const startLivePayments = (socket: WebSocket.Server) => {
  setInterval(() => {
    getPaymentsHTMLService().then((res: string | ServiceError) => {
      if (typeof res === 'string') {
        payments._html = res;
        broadcast(socket, JSON.stringify({
          status: "fetching_payments",
          html: payments._html
        }));
      } else {
        console.error("Failed to retrieve payment list ::: ", res);
      }
    })
  }, 1000 * config.paymentsRefreshTime);
};

const verifyClientAuthentication = (client:WebSocket,req:IncomingMessage)=>{
    //Handle Web Socket Security
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      client.close(4001, 'Unauthorized: Token not provided');
      return;
    }
    verifyUserTokenService(token)
      .then((res) => {
        if (typeof res === 'boolean') {
          if (res === false) {
            client.close(4002, 'Unauthorized: Your token has expired please authenticate');
          }
        } else {
          client.close(4005, 'ServiceError: Failed to validate your token');
        }
      })
      .catch(() => {
        client.close(4005, 'ServiceError: Failed to validate your token');
      });
    //!--Handle Web Socket Security
}

const initiateGridSocket = () => {
  const socket = new WebSocket.Server({ port: config.gridSocketPort });
  console.log('\x1b[35m::: [SOCKETS_GRID_INITIALIZED] :::\x1b[0m');
  startLiveGrid(socket);
  startLivePayments(socket);

  socket.on('connection', (client: WebSocket, req: IncomingMessage) => {

    verifyClientAuthentication(client,req);   

    client.on('message', (message: string) => {
      handleMessage(message.toString(), client, socket);
    });

    client.on('error', (err: Error) => {
      client.send(JSON.stringify({ status: "error", message: 'Failed to complete task ' + err.message }));
    });

    client.on('close', () => {
      client.send(JSON.stringify({ status: "close", message: 'Connection has been closed' }));
      grid.clients -= 1;
      //TODO: Handle disconnect of client
    });
  });

  socket.on('error', (err) => {
    console.log("Failed to initiate Grid Socket ::: ", err.message);
  });
}

export default initiateGridSocket;