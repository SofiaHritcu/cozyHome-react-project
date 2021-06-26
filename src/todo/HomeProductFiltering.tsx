import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonLoading, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonTitle, IonToolbar, useIonViewDidEnter, useIonViewWillEnter } from "@ionic/react";
import { Console } from "console";
import { arrowBackOutline, home } from "ionicons/icons";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import styled from "styled-components";
import { Login } from "../auth";
import { getLogger } from "../core";
import HomeProduct from "./HomeProduct";
import { HomeProductProps } from "./HomeProductProps";
import { HomeProductContext } from "./HomeProductProvider";
import HomeProductStatic from "./HomeProductStatic";

const log = getLogger('HomeProductFilter');


const HomeProductToolBar = styled(IonToolbar)`
    display: inline-block;
    border-radius: 3px;
    padding: 0.7rem 0;
    margin: 0.7rem 1rem;
    width: 11rem;
    background: #ffcc99;
    color: #ffcc99;
    border: 3px solid #ffcc99;
`;

const HomeProductPage = styled(IonPage)`

`;

const HomeProductStyled = styled(HomeProductStatic)`
    background: #ffcc99;
`;

const ButtonStyledExit = styled(IonFab)`
    margin-left:500px;
`;

const HomeProductFilter : React.FC = () =>{
    const [filter, setFilter] = useState<string | undefined>('');
    const [searchShop, setSearchShop] = useState<string>('');
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const {homeProducts, fetching, fetchingError} = useContext(HomeProductContext);
    const [currentIndex, setCurrentIndex] = useState(11); 
    const [homeproductsVisible, setHomeProductsVisible] = useState<HomeProductProps[]>([]); 
    const setOfShops = new Set<string>();
    const [shops,setShops] = useState<string[] | undefined>();
    let arrayOfShops; 


    function wait(){
        return new Promise<void>(resolve => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      }
    

    async function searchNext($event: CustomEvent<void>) {
    if (homeProducts && currentIndex < homeProducts.length) {
        await wait();
        setHomeProductsVisible([...homeproductsVisible, ...homeProducts.slice(currentIndex, 10+currentIndex)]);
        setCurrentIndex(currentIndex + 10);
    } else {
        setDisableInfiniteScroll(true);
    }

    await ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    useEffect(() => {
    
    if (homeProducts?.length) {
        let filteredHomeProducts = Array()
        if(filter === '' || filter === 'none' ){
            filteredHomeProducts = homeProducts
        }else{
            homeProducts.forEach(hp =>{
                if(hp.producer === filter){
                    filteredHomeProducts.push(hp)
                }
            })
        }
        homeProducts?.forEach(hp => {
            setOfShops.add(hp.producer)
        })
        setOfShops.add('none')
        arrayOfShops =  Array.from( setOfShops );
        setShops(arrayOfShops);
        setHomeProductsVisible(filteredHomeProducts.slice(0, 11));
    }
    }, [homeProducts,filter]);




    return (
        <HomeProductPage>
            <IonHeader>
                <HomeProductToolBar>
                    <IonTitle>
                        Search&Filter
                    </IonTitle>
                </HomeProductToolBar>
            </IonHeader>

            <IonSearchbar
                value={searchShop}
                debounce={1000}
                onIonChange={e => setSearchShop(e.detail.value!)}>
            </IonSearchbar>
            <IonContent>
                <IonSelect value={filter} placeholder="select shop" onIonChange={e => setFilter(e.detail.value)}>
                    {shops?.map(shop => <IonSelectOption key={shop} value={shop}>{shop}</IonSelectOption>)}
                </IonSelect>
                <IonLoading isOpen={fetching} message='Fetching home products'/>
                { homeproductsVisible &&(
                    <IonList>
                    {homeproductsVisible
                        .filter(({ _id, name,description,price,producer}) => producer.indexOf(searchShop) >= 0 || name.indexOf(searchShop) >= 0)
                        .map(({ _id, name,description,price,producer,version,photo,latitude,longitude}) => <HomeProductStyled key={_id} _id={_id} name={name} description={description}  price={price} producer={producer} version={version}  photo={photo} latitude={latitude} longitude={longitude} />)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch home products'}</div>
                )}

                <IonFab vertical='bottom' horizontal='end' slot='fixed'>
                </IonFab>
                <IonInfiniteScroll threshold="300px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingSpinner="bubbles"
                        loadingText="loading">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
            </IonContent>
        </HomeProductPage>
    );
};
export default HomeProductFilter;