import React from "react"
import {Link, Route, Switch} from "react-router-dom";
import {AdminEventScreen} from "../AdminEventScreen";
import {AdminEmailInvitesScreen} from "./AdminEmailInvitesScreen";
import AuthRequiredWrapper from "../../components/AuthRequiredWrapper";
import AuthWrapper from "../../event/components/AuthWrapper";

const Content: React.FC = () => {
    return (
        <div>
            <div>
                <Link to={`/admin/email-invites`}>
                    Email invitations
                </Link>
            </div>
        </div>
    )
}


export const AdminScreen: React.FC = () => {
    return (
        <AuthWrapper>
            <AuthRequiredWrapper>
                <Switch>
                    <Route path="/admin/event/:eventID" exact>
                        <AdminEventScreen/>
                    </Route>
                    <Route path="/admin/email-invites" exact>
                        <AdminEmailInvitesScreen/>
                    </Route>
                    <Route path="/admin" exact>
                        <Content/>
                    </Route>
                </Switch>
            </AuthRequiredWrapper>
        </AuthWrapper>
    )
}
