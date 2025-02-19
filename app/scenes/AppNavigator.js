import React, { Component } from "react";
import { Alert, BackHandler } from "react-native";
import { StyleProvider } from "native-base";
import {
  Router,
  Scene,
  Lightbox,
  Actions,
  Modal,
} from "react-native-router-flux";
import i18n from "i18next";
import getTheme from "../../native-base-theme/components";
import platform from "../../native-base-theme/variables/platform";
// Scenes
import AboutApp from "./AboutApp";
import Activity from "./Activity";
import ActivityDetails from "./ActivityDetails";
import ActivityThanks from "./ActivityThanks";
import ActivityEnd from "./ActivityEnd";
import ActivitySummary from "./ActivitySummary";
import AppletDetails from "./AppletDetails";
import AppletList from "./AppletList";
import ChangeStudy from "./ChangeStudy";
import Consent from "./Consent";
import ForgotPassword from "./ForgotPassword";
import InfoAct from "./InfoAct";
import Login from "./Login";
import LogoutWarning from "./LogoutWarning";
import Settings from "./Settings";
import ChangePassword from "./ChangePassword";
// import SideBar from './Sidebar';
import Signup from "./Signup";
import Splash from "./Splash";
import VolumeInfo from "./VolumeInfo";
import BehaviorTime from "./BehaviorTime";
// import { colors } from '../themes/colors';
import AppletInviteFlow from "./AppletInviteFlow";
import AppletSettings from "./AppletSettings";
import AppLanguage from "./AppLanguage";

const theme = getTheme(platform);
theme["NativeBase.Footer"].height = 80;
theme["NativeBase.FooterTab"]["NativeBase.Button"][".active"].backgroundColor =
  "transparent";

// eslint-disable-next-line
const Navigator = Actions.create(
  <Lightbox>
    <Modal hideNavBar>
      <Scene key="root" hideNavBar>
        {/* <Drawer key="side_menu" contentComponent={SideBar}> */}
        <Scene hideNavBar panHandlers={null} drawerLockMode="locked-closed">
          <Scene key="splash" component={Splash} hideNavBar initial />
          <Scene key="about_act" component={InfoAct} />
          <Scene key="about_app" component={AboutApp} />
          <Scene key="about_volume" component={VolumeInfo} />
          <Scene key="activity_details" component={ActivityDetails} />
          <Scene key="applet_details" component={AppletDetails} />
          <Scene key="applet_list" component={AppletList} />
          <Scene key="change_study" component={ChangeStudy} />
          <Scene key="consent" component={Consent} />
          <Scene key="logout_warning" component={LogoutWarning} />
          <Scene key="forgot_password" component={ForgotPassword} />
          <Scene key="login" component={Login} />
          <Scene key="settings" component={Settings} />
          <Scene key="change_password" component={ChangePassword} />
          <Scene key="sign_up" component={Signup} />
          <Scene key="applet_settings" component={AppletSettings} />
          <Scene key="app_language" component={AppLanguage} />
        </Scene>
        {/* </Drawer> */}
      </Scene>
      <Scene key="take_act" component={Activity} />
      <Scene key="set_behavior_times" component={BehaviorTime} />
      <Scene key="invite" component={AppletInviteFlow} />
      <Scene key="activity_summary" component={ActivitySummary} />
      <Scene key="activity_thanks" component={ActivityThanks} />
      <Scene key="activity_end" component={ActivityEnd} />
    </Modal>
  </Lightbox>
);

class AppNavigator extends Component {
  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButton
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    console.log("current route:", Actions.currentScene);
    if (
      Actions.currentScene === "login" ||
      Actions.currentScene === "applet_list"
    ) {
      Alert.alert(
        i18n.t("navigator:exit_title"),
        i18n.t("navigator:exit_subtitle"),
        [
          {
            text: i18n.t("navigator:cancel"),
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => BackHandler.exitApp(),
          },
        ],
        {
          cancelable: false,
        }
      );
      return true;
    }
    if (Actions.currentScene === "applet_details") {
      Actions.push("applet_list");
      return true;
    }
    Actions.pop();
    return true;
  };

  render() {
    return (
      <StyleProvider style={theme}>
        <Router navigator={Navigator} />
      </StyleProvider>
    );
  }
}

export default AppNavigator;
