import React, {useContext, useEffect, useState} from "react";
import {RouteComponentProps} from "react-router";
import HomeProductFilter from "./HomeProductFiltering";
import {getLogger} from "../core";
import {HomeProductProps} from "./HomeProductProps";
import {HomeProductContext} from "./HomeProductProvider";
import {useMyLocation} from "./useMyLocation";
import {Map} from "./GeoMap";
import {
    IonButton,
    IonButtons,
    IonContent, IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import {arrowBackOutline, checkmarkCircleOutline, closeCircleOutline} from "ionicons/icons";
import styled from "styled-components";
import HomeProduct from "./HomeProduct";
import {MapLocating} from "./GeoMapLocating";

const log = getLogger('HomeProductLocating');

interface HomeProductLocatingProps extends RouteComponentProps<{
    id?: string;
}> {}

const StyledTitle = styled(IonTitle)`
  font-size:50px;
  font-family:"Malgun Gothic";
  padding-left: 580px;
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


const HomeProductLocating : React.FC<HomeProductLocatingProps> = ({history,match}) =>{
    const { homeProducts} = useContext(HomeProductContext);
    const [homeProduct, setHomeProduct] = useState<HomeProductProps>();
    const [latitude,setLatitude] = useState(new Number(0));
    const [longitude,setLongitude] = useState(new Number(0));
    // for map
    const myLocation = useMyLocation();
    const { latitude: lat, longitude: lng } = myLocation.position?.coords || {}
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const homeProduct = homeProducts?.find(it => it._id === routeId);
        setHomeProduct(homeProduct);
        if(homeProduct){
            setLatitude(homeProduct.latitude);
            setLongitude(homeProduct.longitude);
        }
        log(latitude,longitude)
    },[match.params.id,homeProducts,latitude,longitude]);
    return (
        <HomeProductPage>
            <IonHeader>
                <HomeProductToolBar>
                    <IonButtons slot="primary">
                    </IonButtons>
                    <StyledTitle>
                        Locate your product
                    </StyledTitle>
                </HomeProductToolBar>
            </IonHeader>
            <IonContent>
                    <MapLocating
                    lat={latitude}
                    lng={longitude}
                    />
                    <IonFab vertical='bottom' horizontal='end' slot='fixed'>
                        <IonFabButton color='white' onClick={() => history.push('/homeProducts')}>
                            <IonIcon icon={arrowBackOutline}/>
                        </IonFabButton>
                    </IonFab>
            </IonContent>
        </HomeProductPage>
    )
};
export default HomeProductLocating;