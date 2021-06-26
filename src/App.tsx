import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { HomeProductProvider } from './todo/HomeProductProvider';
import HomeProductList from './todo/HomeProductList';
import HomeProductEdit from './todo/HomeProductEdit';
import { AuthProvider } from './auth/authProvider';
import { PrivateRoute } from './auth/PrivateRoute';
import { Login } from './auth/Login';
import { searchCircleOutline, searchOutline, triangle } from 'ionicons/icons';
import { HomeProductFilter } from './todo';
import HomeProductLocating from "./todo/HomeProductLocating";

const App: React.FC = () => (
  <IonApp>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <AuthProvider>
                  <Route path="/login" component={Login} exact={true} />
                  <HomeProductProvider>
                    <PrivateRoute path="/homeProducts" component={HomeProductList} exact={true} />
                    <PrivateRoute path="/homeProduct" component={HomeProductEdit} exact={true} />
                    <PrivateRoute path="/homeProduct/:id" component={HomeProductEdit} exact={true} />
                    <PrivateRoute path="/homeProductsFiltering" component={HomeProductFilter} exact={true} />
                    <PrivateRoute path="/homeProductLocating/:id" component={HomeProductLocating} exact={true} />
                  </HomeProductProvider>
                  <Route exact path="/" render={() => <Redirect to="/homeProducts" />} />
                </AuthProvider>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="filterAndSearch" href="/homeProductsFiltering" layout='icon-start'>
                <IonIcon icon={searchOutline} />
                <IonLabel>Search&Filter</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
  </IonApp>
);

export default App;
