import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { HomeProductProps } from './HomeProductProps';
import { createHomeProduct, getHomeProducts, newWebSocket, updateHomeProduct } from './HomeProductAPI';
import { AuthContext, Login } from '../auth';
import HomeProduct from './HomeProduct';
import { Plugins } from '@capacitor/core';
import { useNetwork } from './useNetwork';
const { Storage } = Plugins;

const log = getLogger('HomeProductProvider');

type SaveHomeProductFn = (homeProduct: HomeProductProps) => Promise<any>;

export interface HomeProductsState {
  homeProducts?: HomeProductProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveHomeProduct?: SaveHomeProductFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: HomeProductsState = {
  fetching: false,
  saving: false,
};
const FETCH_HOME_PRODUCTS_STARTED = 'FETCH_HOME_PRODUCTS_STARTED';
const FETCH_HOME_PRODUCTS_SUCCEEDED = 'FETCH_HOME_PRODUCTS_SUCCEEDED';
const FETCH_HOME_PRODUCTS_FAILED = 'FETCH_HOME_PRODUCTS_FAILED';
const SAVE_HOME_PRODUCT_STARTED = 'SAVE_HOME_PRODUCT_STARTED';
const SAVE_HOME_PRODUCT_SUCCEEDED = 'SAVE_HOME_PRODUCT_SUCCEEDED';
const SAVE_HOME_PRODUCT_FAILED = 'SAVE_HOME_PRODUCT_FAILED';

const reducer: (state: HomeProductsState, action: ActionProps) => HomeProductsState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_HOME_PRODUCTS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_HOME_PRODUCTS_SUCCEEDED:
        return { ...state, homeProducts: payload.homeProducts, fetching: false };
      case FETCH_HOME_PRODUCTS_FAILED:
        return { ...state, homeProducts: payload.homeProducts,fetching: false};
      case SAVE_HOME_PRODUCT_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_HOME_PRODUCT_SUCCEEDED:
        const homeProducts = [...(state.homeProducts || [])];
        const homeProduct = payload.homeProduct;
        const index = homeProducts.findIndex(it => it._id === homeProduct._id);
        if (index === -1) {
          homeProducts.splice(0, 0, homeProduct);
        } else {
          homeProducts[index] = homeProduct;
        }
        return { ...state, homeProducts, saving: false };
      case SAVE_HOME_PRODUCT_FAILED:
        const homeProducts1 = [...(state.homeProducts || [])];
        const homeProduct1 = payload.homeProduct;
        const index1 = homeProducts1.findIndex(it => it._id === homeProduct1._id);
        if (index1 === -1) {
          homeProducts1.splice(0, 0, homeProduct1);
        } else {
          homeProducts1[index1] = homeProduct1;
        }
        return { ...state, homeProducts1, saving: false };
      default:
        return state;
    }
  };

export const HomeProductContext = React.createContext<HomeProductsState>(initialState);

interface HomeProductProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const HomeProductProvider: React.FC<HomeProductProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { homeProducts, fetching, fetchingError, saving, savingError } = state;
  useEffect(getHomeProductsEffect, [token]);
  useEffect(wsEffect, [token]);
  const saveHomeProduct = useCallback<SaveHomeProductFn>(saveHomeProductCallback, [token]);
  const value = { homeProducts, fetching, fetchingError, saving, savingError, saveHomeProduct };
  log('returns');
  return (
    <HomeProductContext.Provider value={value}>
      {children}
    </HomeProductContext.Provider>
  );

  function getHomeProductsEffect() {
    let canceled = false;
    fetchHomeProducts();
    return () => {
      canceled = true;
    }

    async function fetchHomeProducts() {
      if (!token?.trim()) {
        return;
      }
      try {
        log('fetchHomeProducts started');
        dispatch({ type: FETCH_HOME_PRODUCTS_STARTED });
        log(token);
        var homeProductsLocally = Array<HomeProductProps>();
        Storage.get({key:'hps'}).then(res =>{
          if(res.value){
            homeProductsLocally = Array.from(JSON.parse(res.value))
            Storage.keys().then( res1 =>{
              const numberOfToBeSaved = res1.keys.length - homeProductsLocally.length - 3
              const indexAlreadySaved = homeProductsLocally.length - 1
              for (let i = 1; i <= numberOfToBeSaved; i++) {
                const currentIndex = indexAlreadySaved + i;
                Storage.get({key:'hpToBeSaved'+currentIndex}).then( hp =>{
                  if(hp.value){
                    const toBeSaved = hp.value.toString().split(',')
                    log(toBeSaved)
                    const name = toBeSaved[0].split(':')[1].split('"')[1]
                    const description = toBeSaved[1].split(':')[1].split('"')[1]
                    const producer = toBeSaved[2].split(':')[1].split('"')[1]
                    //const price = Number.parseInt(toBeSaved[3].split(':')[1].slice(0,-1))
                    const price = Number.parseInt(toBeSaved[3].split(':')[1])
                    const photo = toBeSaved[4].split(':')[1]
                    alert(photo)
                    const latitude =  Number.parseFloat(toBeSaved[5].split(':')[1])
                    const longitude = Number.parseFloat(toBeSaved[6].split(':')[1])
                    const version =1;
                    const hpSaving : HomeProductProps= {name,description,producer,price,version,photo,latitude,longitude}
                    const savedHomeProduct =  createHomeProduct(token, hpSaving).then( succes =>{
                      dispatch({ type: SAVE_HOME_PRODUCT_SUCCEEDED, payload: { homeProduct: succes } });
                    });
                    log('saveHomeProduct from offline succeeded');
                    // Storage.set({key:'hpToBeSaved',value:''}).then(()=>{
                    //   Storage.set({key:'hpToBeSaved'+currentIndex,value:''}).then(()=>{
                    //     log('saveHomeProduct from offline succeeded');
                    //   })
                    // })
                    //log( name+' '+description+' '+producer+' '+price)
                  }
                })
              }
            });
          }
        })
        var homeProducts;
        homeProducts = await getHomeProducts(token);
        log('fetchHomeProducts succeeded');
        if (!canceled) {
          var pos = 0;
          if((await Storage.keys()).keys.find(x=>x==='hps')===undefined){
            log('firstLocalallySaving')
            homeProducts?.forEach(hp =>{
              Storage.set({
                key: 'hp'+pos,
                value: JSON.stringify({
                  homeProduct:hp
                })
              });
              pos ++;
            })
          }
          Storage.set({key:'hps',value:JSON.stringify(homeProducts)});
          dispatch({ type: FETCH_HOME_PRODUCTS_SUCCEEDED, payload: { homeProducts } });
        }
      } catch (error) {
        log('fetchHomeProducts failed');
        const homeProductsStringified = await Storage.get({key:'hps'})
        var homeProducts;
        if(homeProductsStringified.value !== null){
          homeProducts = JSON.parse(homeProductsStringified.value);
        }
        dispatch({ type: FETCH_HOME_PRODUCTS_FAILED, payload: { homeProducts } });
      }
    }
  }

  async function saveHomeProductCallback(homeProduct: HomeProductProps) {
    try {
      log('saveHomeProduct started');
      dispatch({ type: SAVE_HOME_PRODUCT_STARTED });
      const savedHomeProduct = await (homeProduct._id ? updateHomeProduct(token, homeProduct) : createHomeProduct(token, homeProduct));
      log('saveHomeProduct succeeded');
      dispatch({ type: SAVE_HOME_PRODUCT_SUCCEEDED, payload: { homeProduct: savedHomeProduct } });
    } catch (error) {
      log('saveHomeProduct failed');
      log('saveHomeProduct started');
      dispatch({ type: SAVE_HOME_PRODUCT_STARTED });
      const homeProductsStringified = await Storage.get({key:'hps'})
        var homeProducts;
        if(homeProductsStringified.value !== null){
          homeProducts = JSON.parse(homeProductsStringified.value);
        }
      const index = Array.from(homeProducts).length 
      Storage.set({key:'hpToBeSaved'+index,value:JSON.stringify(homeProduct)})
      Storage.set({key:'hpToBeSaved',value:JSON.stringify(homeProduct)})
      //Storage.set({key:'hps',value:JSON.stringify([...homeProducts,homeProduct])})
      dispatch({ type: SAVE_HOME_PRODUCT_FAILED, payload: { homeProduct: homeProduct } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: homeProduct } = message;
        log(`ws message, homeProduct ${type}`);
        if (type === 'created' || type === 'updated') {
          dispatch({ type: SAVE_HOME_PRODUCT_SUCCEEDED, payload: { homeProduct } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};
