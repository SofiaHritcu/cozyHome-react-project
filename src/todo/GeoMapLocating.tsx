import React from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';
import { compose, withProps } from 'recompose';
import { mapsApiKey } from './mapsApiKey';



interface MapProps {
    lat?: number;
    lng?: number;
}

export const MapLocating =
    compose<MapProps, any>(
        withProps({
            googleMapURL:
                `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&v=3.exp&libraries=geometry,drawing,places`,
            loadingElement: <div style={{ height: `580px` }} />,
            containerElement: <div style={{ height: `580px` ,paddingLeft:`400px`,paddingTop:`50px`}} />,
            mapElement: <div style={{ height: `580px`, width:`800px` }} />
        }),
        withScriptjs,
        withGoogleMap
    )(props => (
        <GoogleMap
            defaultZoom={7}
            defaultCenter={{ lat: props.lat, lng: props.lng }}
        >
            <Marker
                position={{ lat: props.lat, lng: props.lng }}
                draggable={false}
            >
                <InfoWindow
                >
                    <div>
                        <p>Here you can find the product!</p>
                    </div>
                </InfoWindow>
            </Marker>
        </GoogleMap>
    ))
