import {IonCard, IonCol, IonIcon, IonImg, IonItem, IonLabel, IonRow, IonText, IonTabButton} from '@ionic/react';
import {bookmark, bookmarkOutline, cartOutline, cashOutline, checkmark, pin} from 'ionicons/icons';
import React, {useEffect, useState} from 'react'
import styled from 'styled-components';
import { HomeProductProps } from './HomeProductProps';
import {usePhotoGallery} from "./usePhotoGallery";
import {Button} from "@material-ui/core";
import {RouteComponentProps} from "react-router";

interface HomeProductPropsExt extends HomeProductProps {
    onEdit: (id?: string) => void;
    onLocate: (id?: string) => void;
}

const StyledTextName = styled(IonText)`
    font-size:20px;
    padding-right: 50px;
    color:#ff884d;
    font-family:"Malgun Gothic";
`;
const StyledTextDescription = styled(IonText)`
    font-size:20px;
    font-family:"Malgun Gothic";
    padding-right: 50px;
    color:#ff884d;
`;
const StyledTextProducer = styled(IonText)`
    font-size:20px;
    font-family:"Malgun Gothic";
    padding-right: 50px;
    color:#ff884d;
`;
const StyledTextPrice = styled(IonText)`
    font-size:20px;
    font-family:"Malgun Gothic";
    padding-right: 50px;
    color:#ff884d;
`;

const StyledLabel = styled(IonLabel)`
    padding:10px;
    height:400px`;

const StyledImage = styled(IonImg)`
  height: 250px;
  width: 200px;
`
const StyledIonItem = styled(IonItem)`
  height: 400px;
`
const StyledIonCard = styled(IonCard)`
  height: 400px;
`

const HomeProduct : React.FC<HomeProductProps> =  ({_id,name,description,producer,price,photo,latitude,longitude}) =>{
    return (
        <StyledIonItem >
            <StyledLabel>
                <IonIcon icon={checkmark}/><StyledTextName>    {name} </StyledTextName>
                <IonIcon icon={bookmarkOutline}/><StyledTextDescription>    {description} </StyledTextDescription>
                <IonIcon icon={cartOutline}/><StyledTextProducer>    {producer} </StyledTextProducer>
                <IonIcon icon={cashOutline}></IonIcon><StyledTextPrice>    {price} </StyledTextPrice>
                <IonIcon icon={pin}></IonIcon><StyledTextPrice>    {latitude+" "+longitude} </StyledTextPrice>
                <StyledIonCard>
                    <StyledImage src={photo}></StyledImage>
                </StyledIonCard>
            </StyledLabel>
        </StyledIonItem>
    );
};


export default HomeProduct;