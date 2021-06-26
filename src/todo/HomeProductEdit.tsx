import { IonAlert, IonButton, IonButtons, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonImg, IonInput, IonLoading, IonPage, IonRow, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router';
import styled from 'styled-components';
import { getLogger } from '../core';
import HomeProduct from './HomeProduct';
import { HomeProductProps } from './HomeProductProps';
import { HomeProductContext } from './HomeProductProvider';
import { Plugins } from '@capacitor/core';
import {home, key, keySharp, logoFoursquare} from 'ionicons/icons';
import { camera } from 'ionicons/icons';
import { usePhotoGallery } from './usePhotoGallery';
import {getUrl} from "ionicons/dist/types/components/icon/utils";
import {useMyLocation} from "./useMyLocation";
import {Map} from "./GeoMap";
import TextField from '@material-ui/core/TextField';
import { createAnimation } from '@ionic/react';


const { Storage } = Plugins;



const log = getLogger('HomeProductEdit');

interface HomeProductEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const HomeProductInput = styled(IonInput)`
  color : #ffcc99;
`
const HomeProductTextField = styled(TextField)`
  color : #ffcc99;
`

const ButtonStyledAddPhoto = styled(IonFab)`
    margin-left:610px;
`;


const HomeProductEdit: React.FC<HomeProductEditProps> = ({history, match}) => {
    const { homeProducts, saving, savingError, saveHomeProduct } = useContext(HomeProductContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [producer, setProducer] = useState('');
    const [price, setPrice] = useState(new Number(0));
    const [homeProduct, setHomeProduct] = useState<HomeProductProps>();
    const [version,setVersion] = useState( new Number(1));
    const [showAlert, setShowAlert] = useState(false);
    const [versionConflict,setVersionConflict] =useState(false);
    const[showAlertVersionConflict,setShowAlertVersionConflict] = useState(false);
    const [savedKey, setSavedKey] = useState('');
    const [showTextAreaUnUpdated,setShowTextAreaUnUpdated] = useState(true);

    // for camera
    const { photos,takePhoto } = usePhotoGallery();
    const [photo,setPhoto] = useState('');

    // for map
    const myLocation = useMyLocation();
    const { latitude: lat, longitude: lng } = myLocation.position?.coords || {}
    const [latitude,setLatitude] = useState(0);
    const [longitude,setLongitude] = useState(0);


    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const homeProduct = homeProducts?.find(it =>it._id === routeId);
        setHomeProduct(homeProduct);
        log('before conflict'+versionConflict);
        if (homeProduct) {
            setPhoto(homeProduct.photo);
            Storage.keys().then(keys=>{
            keys.keys.forEach(x=>{
              if(x!=='user' && x!=='hps' && x!=='photos'){
                Storage.get({key:x}).then((y)=>{
                  if(y.value){
                    const locallyHp = y.value.toString().split(',');
                      let nameLocal;
                      if(locallyHp[0].slice(16).indexOf(':')!==-1){
                          nameLocal  = locallyHp[0].slice(16).split(':')[1].split('"')[1]
                      }else{
                          nameLocal= ''
                      }
                    const descriptionLocal = locallyHp[1].split(':')[1].split('"')[1]

                    const producerLocal = locallyHp[2].split(':')[1].split('"')[1]
                    const priceLocal = Number.parseInt(locallyHp[3].split(':')[1])
                    const versionLocal =Number.parseInt(locallyHp[4].split(':')[1].slice(0,-1));
                    // descriptionLocal === homeProduct.description  &&
                    if( nameLocal === homeProduct.name ){
                              log("conflictVersion: "+versionLocal+" "+homeProduct.version)
                              if(versionLocal !== homeProduct.version && !isNaN(versionLocal) ){
                                setSavedKey(x)
                                setName(homeProduct.name);
                                setDescription(descriptionLocal);
                                setProducer(producerLocal);
                                setPrice(priceLocal);
                                setVersion(homeProduct.version);
                                setVersionConflict(true)

                              }
                    }
                  }
                })
              }
            })
          })
          if(!versionConflict){
            setName(homeProduct.name);
            setDescription(homeProduct.description);
            setProducer(homeProduct.producer);
            setPrice(homeProduct.price);
            setVersion(homeProduct.version);
            setPhoto(homeProduct.photo);
        }
        }
      }, [match.params.id, homeProducts]);


    useEffect(()=>{
        if(photos[0] !== undefined ){
            if(photos[0].webviewPath !== undefined){
                setPhoto(photos[0].webviewPath);
            }
        }
    },[photos])
      const handleSave = () => {
          if(name !== '' && producer !== '' && price !== 0){
            setShowAlert(true);
            const editedHomeProduct = homeProduct ? { ...homeProduct, name, description, producer, price,version,photo,latitude,longitude } : { name, description, producer, price,version,photo,latitude,longitude};
            saveHomeProduct && saveHomeProduct(editedHomeProduct).then(() => history.goBack());
          }else {
              const nameElem = document.querySelector('.name');
              const descriptionElem = document.querySelector('.description');
              const producerElem = document.querySelector('.producer');
              const priceElem = document.querySelector('.price');
              // group animation
              if (nameElem && producerElem && priceElem && descriptionElem) {
                  const animationMoving = createAnimation()
                      .addElement(nameElem)
                      .addElement(producerElem)
                      .addElement(priceElem)
                      .duration(1000)
                      .direction('alternate')
                      .iterations(2)
                      .keyframes([
                          {offset: 0.1, transform: 'translate3d(-1px,0,0)'},
                          {offset: 0.2, transform: 'translate3d(2px,0,0)'},
                          {offset: 0.3, transform: 'translate3d(-4px,0,0)'},
                          {offset: 0.4, transform: 'translate3d(4px,0,0)'},
                          {offset: 0.5, transform: 'translate3d(-4px,0,0)'},
                          {offset: 0.6, transform: 'translate3d(4px,0,0)'},
                          {offset: 0.7, transform: 'translate3d(-4px,0,0)'},
                          {offset: 0.8, transform: 'translate3d(2px,0,0)'},
                          {offset: 0.9, transform: 'translate3d(-1px,0,0)'},
                      ]);
                  const animationColoring = createAnimation()
                      .addElement(descriptionElem)
                      .duration(1000)
                      .keyframes([
                          {offset: 0.1, transform: 'scale(1.1)'},
                          {offset: 0.2, transform: 'scale(1.2)'},
                          {offset: 0.3, transform: 'scale(1.5)'},
                          {offset: 0.9, transform: 'scale(2)'},
                          ])
                      .afterStyles({
                          'color': 'green'});
                  const groupAnimation = createAnimation()
                      .duration(1000)
                      .addAnimation([animationMoving, animationColoring]);
                  groupAnimation.play();
              }
          }
      };
      log('render');
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleSave}>
                  Save
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <HomeProductInput className={"name"} value={name} placeholder="enter name" onIonChange={e => setName(e.detail.value || '')} />
            <HomeProductInput className={"description"} value={description} placeholder="enter description" onIonChange={e => setDescription(e.detail.value || '')} />
            <HomeProductInput className={"producer"} value={producer} placeholder="enter producer" onIonChange={e => setProducer(e.detail.value || '')} />
            <HomeProductInput className={"price"} value={price.toString()} placeholder="enter price"  onIonChange={e => setPrice(new Number(e.detail.value) || 0)} />
            <HomeProductTextField id="input-with-icon-grid" label="your product is here" fullWidth value={latitude+" "+longitude}/>
              <IonTextarea
              disabled
              readonly
              hidden={showTextAreaUnUpdated}
              value={'You have an old version of the product !!!'}
              ></IonTextarea>
            {/* <IonLoading isOpen={saving} /> */}
            <IonCard >
                    <IonRow>
                        <IonCol size="4" >
                            <IonImg src={photo}/>
                        </IonCol>
                    </IonRow>
            </IonCard>
            {lat && lng &&
            <Map
              lat={lat}
              lng={lng}
              onMapClick={log('onMap')}
              onMarkerClick={getLatLng()}
            />}
            <ButtonStyledAddPhoto  vertical='bottom' slot='fixed'>
                                <IonFabButton color='black' onClick={()=>{takePhoto()
                                }}>
                                <IonIcon icon={camera}></IonIcon>
                                </IonFabButton>
            </ButtonStyledAddPhoto>
            <IonAlert
                  isOpen={saving}
                  onDidDismiss={() => {setShowAlert(false);
                    }}
                  header={'unsaved home products:'}
                  message={name+' '+description+' '+producer+' '+price}
                  buttons={['WAIT']}
                />
            {savingError && (
              <div>{savingError.message || 'Failed to save homeProduct'}</div>
            )}
          </IonContent>
          <IonAlert
            isOpen={versionConflict}
            onDidDismiss={() => {setShowAlertVersionConflict(false);
              }}
            header={'version conflicts'}
            message={'Do you want to update your version of product?'}
            buttons={[{text:'OK',handler:()=>{if(homeProduct!==undefined){
                setName(homeProduct.name);
                setDescription(homeProduct.description);
                setProducer(homeProduct.producer);
                setPrice(homeProduct.price);
                setVersion(homeProduct.version);
                setPhoto(homeProduct.photo);

                Storage.set({key:savedKey,value:JSON.stringify(homeProduct)})
            }}},
            {
              text:'cancel',handler:()=>{
                setShowTextAreaUnUpdated(false);
              }
            }
            ]}
          />
        </IonPage>
      );
    function log(source: string) {
        return (e: any) => console.log(source, e.latLng.lat(), e.latLng.lng());
    }

    function getLatLng(){
            return (e:any) => {setLatitude(e.latLng.lat());setLongitude(e.latLng.lng());log(latitude+" "+longitude+"on marker");};
        }
    };

    export default HomeProductEdit;
    

