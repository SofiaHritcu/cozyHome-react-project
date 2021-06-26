import { IonAlert, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonList, IonLoading, IonMenuButton, IonPage, IonTitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { add, checkmarkCircleOutline, closeCircleOutline, cloudOffline, notificationsOffOutline, wifi} from 'ionicons/icons';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import HomeProduct from './HomeProduct';
import styled from 'styled-components';
import {getLogger} from '../core';
import { HomeProductContext } from './HomeProductProvider';
import { RouteComponentProps } from 'react-router';
import { exit } from 'ionicons/icons';
import { Plugins } from '@capacitor/core';
import { AuthContext, AuthState } from '../auth/authProvider';
import { HomeProductProps } from './HomeProductProps';
import { useNetwork } from './useNetwork';
import { usePhotoGallery } from './usePhotoGallery';
import {Button} from "@material-ui/core";
import { createAnimation } from '@ionic/react';
import {AnimatedModal} from "./AnimatedModal";
const { Storage } = Plugins;



const log = getLogger('HomeProductList');

const StyledTitle = styled(IonTitle)`
  font-size:50px;
  font-family:"Malgun Gothic",serif;
  padding-left: 550px;
  color:#ff884d;
`

const StyledIcon = styled(IonIcon)`
  font-size:40px;
`

const HomeProductToolBar = styled(IonToolbar)`
    display: inline-block;
    border-radius: 3px;
    padding: 0.7rem 0;
    margin: 0.7rem 1rem;
    width: 98rem;
    background: #ffcc99;
    color: #ffcc99;
    border: 2px solid #ffcc99;
`;

const HomeProductPage = styled(IonPage)`

`;

const HomeProductStyled = styled(HomeProduct)`
    background: #ffcc99;
`;

const ButtonStyledExit = styled(IonFab)`
    margin-left:670px;
`;

const StyledIonItem = styled(IonItem)`
  height: 400px;
`


const HomeProductList : React.FC<RouteComponentProps> = ({ history}) =>{
    const {homeProducts, fetching, fetchingError} = useContext(HomeProductContext);
    const {logout} = useContext(AuthContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState(11); 
    const [homeproductsVisible, setHomeProductsVisible] = useState<HomeProductProps[]>([]); 
    const { networkStatus } = useNetwork();

    // for images
    const { photos } = usePhotoGallery();

    const handleLogout = () => {
        (async () => {await Storage.clear();})();
        log('handleLogout...');
        logout?.();
    };
    
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
      setHomeProductsVisible(homeProducts.slice(0, 11));
    }
  }, [homeProducts]);

  const handleMouseOver = () => {
      const titleElem = document.querySelector('.title');
      const addElem = document.querySelector('.add');
      const exitElem = document.querySelector('.exit');
      if(titleElem && addElem && exitElem){
          // basic animation
          const animationTitle = createAnimation()
              .addElement(titleElem)
              .duration(1000)
              .iterations(1)
              .keyframes ([
                  {offset: 0.5, transform: 'scale(1.2)'},
                  {offset: 1, transform: 'translate(1em,0)'},

              ])
          const animationButtons = createAnimation()
              .addElement(addElem)
              .addElement(exitElem)
              .duration(1000)
              .fromTo('transform', 'scale(0.5)', 'scale(1)')
              ;
          (async () => {
              await animationTitle.play();
              await animationButtons.play();
          })();
      }

  }

    log('HomeProduct render');
    return (
        <HomeProductPage>
            <IonHeader>
                <HomeProductToolBar>
                    <IonButtons slot="start">
                    <IonButton>
                      <StyledIcon icon={checkmarkCircleOutline} hidden={!networkStatus.connected}/>
                      <StyledIcon icon={closeCircleOutline} hidden={networkStatus.connected} />
                    </IonButton>
                    </IonButtons>
                    <IonButtons slot="primary">
                    </IonButtons>
                    <StyledTitle className={"title"} onMouseOver={handleMouseOver}>
                        CozyHome
                    </StyledTitle>
                </HomeProductToolBar>
            </IonHeader>
            <IonContent> 
                <IonLoading isOpen={fetching} message='Fetching home products'/>
                { homeproductsVisible &&(
                    <IonList>
                       {homeproductsVisible.map(({ _id, name,description,price,producer,version,photo,latitude,longitude}) =>
                       <StyledIonItem>
                         <HomeProductStyled key={_id} _id={_id} name={name} description={description} price={price} producer={producer} version={version} photo={photo} latitude={latitude} longitude={longitude} onEdit={id => history.push(`/homeProduct/${id}`)} onLocate={id => history.push(`/homeProductLocating/${id}`)}/>
                       </StyledIonItem>
                       )}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch home products'}</div>
                )}

                <IonFab vertical='bottom' horizontal='end' slot='fixed'>
                    <IonFabButton class={"add"} color='white' onClick={() => history.push('/homeProduct')}>
                        <IonIcon icon={add}/>                   
                    </IonFabButton>
                    
                </IonFab>
                <ButtonStyledExit class={"exit"} horizontal='center' vertical='bottom' slot='fixed'>
                                <IonFabButton color='white' onClick={handleLogout}>
                                    <IonIcon icon={exit}/>                   
                                </IonFabButton>
                </ButtonStyledExit>
                <IonInfiniteScroll threshold="300px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingSpinner="bubbles"
                        loadingText="Loading more">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
                
            </IonContent>
            <AnimatedModal/>
        </HomeProductPage>
    )
};

export default HomeProductList;