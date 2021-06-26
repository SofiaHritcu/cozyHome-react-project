import axios from 'axios'
import { getLogger ,baseUrl,authConfig,withLogs} from '../core'
import { HomeProductProps } from './HomeProductProps'


const homeProductURL = `http://${baseUrl}/api/homeProduct`;

interface ResponseProps<T> {
    data: T;
}

export const getHomeProducts: (token: string) => Promise<HomeProductProps[]> = token => {
    return withLogs(axios.get(homeProductURL,authConfig(token)),'getHomeProducts');
}

export const createHomeProduct: (token: string,homeProduct: HomeProductProps) => Promise<HomeProductProps[]> = (token,homeProduct) => {
    return withLogs(axios.post(homeProductURL,homeProduct,authConfig(token)),'crateHomeProduct')
}

export const updateHomeProduct: (token: string,homeProduct: HomeProductProps) => Promise<HomeProductProps[]> = (token,homeProduct) => {
    return withLogs(axios.put(`${homeProductURL}/${homeProduct._id}`, homeProduct, authConfig(token)), 'updateHomeProduct');
}

interface MessageData {
  type: string;
  payload: HomeProductProps;
}
const log = getLogger('ws');
export const newWebSocket = (token:string,onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
      log('web socket onopen');
      ws.send(JSON.stringify({type: 'authorization',payload: {token}}));
    };
    ws.onclose = () => {
      log('web socket onclose');
    };
    ws.onerror = error => {
      log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
      log('web socket onmessage');
      onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
      ws.close();
    }
  }
  