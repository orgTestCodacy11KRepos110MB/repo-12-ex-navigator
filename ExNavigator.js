'use strict';

import React from 'react-native';
let {
  Navigator,
  PropTypes,
} = React;

import cloneReferencedElement from 'react-native-clone-referenced-element';

import ExNavigatorStyles from './ExNavigatorStyles';
import ExRouteRenderer from './ExRouteRenderer';
import ExSceneConfigs from './ExSceneConfigs';

import type * as ExRoute from './ExRoute';

export default class ExNavigator extends React.Component {
  static propTypes = {
    ...Navigator.props,
    showNavigationBar: PropTypes.bool,
  };

  static defaultProps = {
    showNavigationBar: true,
  };

  constructor() {
    super(props, context);
    this._renderScene = this._renderScene.bind(this);
    this._setNavigatorRef = this._setNavigatorRef.bind(this);
  }

  render() {
    return (
      <Navigator
        {...this.props}
        ref={this._setNavigatorRef}
        configureScene={ExRouteRenderer.configureScene}
        renderScene={this._renderScene}
        navigationBar={this._renderNavigationBar()}
        sceneStyle={[ExNavigatorStyles.scene, this.props.sceneStyle]}
        style={[ExNavigatorStyles.navigator, this.props.style]}
      />
    );
  }

  _renderScene(route: ExRoute, navigator: Navigator) {
    // We need to subscribe to the navigation context before the navigator is
    // mounted because it emits a didfocus event when it is mounted, before we
    // can get a ref to it
    if (!this._subscribedToFocusEvents) {
      this._subscribeToFocusEvents(navigator);
    }

    let scene = ExRouteRenderer.renderScene(route, navigator);
    let firstRoute = navigator.getCurrentRoutes()[0];
    if (route === firstRoute) {
      scene = cloneReferencedElement(scene, {
        ref: component => { this._firstScene = component; },
      });
    }
    return scene;
  }

  _renderNavigationBar(): ?Navigator.NavigationBar {
    if (!this.props.showNavigationBar) {
      return null;
    }

    return (
      <Navigator.NavigationBar
        routeMapper={ExRouteRenderer.navigationBarRouteMapper}
        style={ExNavigatorStyles.bar}
      />
    );
  }

  @autobind
  _setNavigatorRef(navigator) {
    this._navigator = navigator;
    if (navigator) {
      if (!this._subscribedToFocusEvents) {
        throw new Error('Expected to have subscribed to the navigator before ' +
          'it was mounted.');
      }
    } else {
      this._unsubscribeFromFocusEvents(navigator);
    }
  }

  _subscribeToFocusEvents(navigator) {
    if (this._subscribedToFocusEvents) {
      throw new Error('The navigator is already subscribed to focus events');
    }

    let navigationContext = navigator.navigationContext;
    this._onWillFocusSubscription = navigationContext.addListener(
      'willfocus',
      ExRouteRenderer.onWillFocus,
    );
    this._onDidFocusSubscription = navigationContext.addListener(
      'didfocus',
      ExRouteRenderer.onDidFocus,
    );
    this._subscribedToFocusEvents = true;
  }

  _unsubscribeFromFocusEvents() {
    this._onWillFocusSubscription.remove();
    this._onDidFocusSubscription.remove();
    this._subscribedToFocusEvents = false;
  }

  // Navigator methods

  getCurrentRoutes() {
    return this._navigator.getCurrentRoutes();
  }

  jumpBack() {
    return this._navigator.jumpBack();
  }

  jumpForward() {
    return this._navigator.jumpForward();
  }

  jumpTo(route) {
    return this._navigator.jumpTo(route);
  }

  push(route) {
    return this._navigator.push(route);
  }

  pop() {
    return this._navigator.pop();
  }

  replace(route) {
    return this._navigator.replace(route);
  }

  replaceAtIndex(route, index) {
    return this._navigator.replaceAtIndex(route, index);
  }

  replacePrevious(route) {
    return this._navigator.replacePrevious(route);
  }

  immediatelyResetRouteStack(routeStack) {
    return this._navigator.immediatelyResetRouteStack(routeStack);
  }

  popToRoute(route) {
    return this._navigator.popToRoute(route);
  }

  popToTop() {
    return this._navigator.popToTop();
  }
}

export {
  ExNavigatorStyles as Styles,
  ExSceneConfigs as SceneConfigs,
};