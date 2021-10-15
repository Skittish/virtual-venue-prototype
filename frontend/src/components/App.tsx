import React from "react"
import {BrowserRouter, Route, Switch} from "react-router-dom";
import EventScreen from "../screens/EventScreen";
import { GlobalStyle } from "../ui/global";
import SignOut from "../screens/SignOut";
import CreateEventScreen from "../screens/createEvent/CreateEventScreen";
import {HelmetProvider} from "react-helmet-async";
import LandingScreen from "../screens/landing/LandingScreen";
import {AdminEventScreen} from "../screens/AdminEventScreen";
import {SettingsScreen} from "../screens/SettingsScreen";
import {EventAdminScreen} from "../screens/EventAdminScreen";
import {BillingScreen} from "../screens/billing/BillingScreen";
import {AdminScreen} from "../screens/admin/AdminScreen";
import {SignupScreen} from "../screens/signup/SignupScreen";

const App: React.FC = () => {
    return (
        <HelmetProvider>
            <GlobalStyle/>
            <BrowserRouter>
                <Switch>
                    <Route path="/event/:eventID/admin" exact>
                        <EventAdminScreen/>
                    </Route>
                    <Route path="/event/:eventID">
                        <EventScreen/>
                    </Route>
                    <Route path="/admin">
                        <AdminScreen/>
                    </Route>
                    <Route path="/create">
                        <CreateEventScreen/>
                    </Route>
                    <Route path="/signOut">
                        <SignOut/>
                    </Route>
                    <Route path="/signup">
                        <SignupScreen/>
                    </Route>
                    <Route path="/settings">
                        <SettingsScreen/>
                    </Route>
                    <Route path="/billing">
                        <BillingScreen/>
                    </Route>
                    <Route path="/">
                        <LandingScreen/>
                    </Route>
                </Switch>
            </BrowserRouter>
        </HelmetProvider>
    )
}

export default App
