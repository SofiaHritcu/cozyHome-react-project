import React, { useState } from 'react';
import { createAnimation, IonModal, IonButton, IonContent } from '@ionic/react';
import {useMyLocation} from "./useMyLocation";
import {Map} from "./GeoMap";

export const AnimatedModal: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const myLocation = useMyLocation();
    const { latitude: lat, longitude: lng } = myLocation.position?.coords || {}

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    return (
        <>
            <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                <div>My Location is</div>
                <div>latitude: {lat}</div>
                <div>longitude: {lng}</div>
                {lat && lng &&
                <Map
                    lat={lat}
                    lng={lng}
                />}
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
            </IonModal>
            <IonButton onClick={() => setShowModal(true)}>Were Am I?</IonButton>
        </>
    );
};
