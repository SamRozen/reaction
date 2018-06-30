import { themeProps } from "@artsy/palette"
import { bind, once, throttle } from "lodash"
import OpenSeaDragon from "openseadragon"
import React from "react"
import ReactDOM from "react-dom"
import styled from "styled-components"
import { themeGet } from "styled-system"
import { Flex } from "Styleguide/Elements/Flex"
import { Slider, SliderProps } from "./LightboxSlider"

const DeepZoomContainer = styled.div`
  position: fixed !important;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  transition: opacity 0.5s;
  background-color: ${themeGet("colors.black100")};
`

export interface LightboxProps {
  deepZoom: {
    Image: {
      xmlns: string
      Url: string
      Format: string
      Overlap: number
      TileSize: number
      Size: {
        Width: number
        Height: number
      }
    }
  }
}

export interface LightboxState {
  shown: boolean
  element: Element
  viewer: any
  deepZoomRef: any
  slider: SliderProps
}

export class Lightbox extends React.Component<LightboxProps, LightboxState> {
  state = {
    element: null,
    viewer: null,
    shown: false,
    deepZoomRef: React.createRef(),
    slider: {
      min: 0,
      max: 1,
      step: 0.01,
      value: 0,
    },
  }

  renderLightbox() {
    const { slider } = this.state
    return (
      <React.Fragment>
        <DeepZoomContainer innerRef={this.state.deepZoomRef as any} />
        <Flex
          position="absolute"
          width="100%"
          justifyContent="center"
          bottom={themeProps.space["2"]}
        >
          <Slider
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={slider.value}
          />
        </Flex>
      </React.Fragment>
    )
  }

  renderPortal = () => {
    return this.state.element
      ? ReactDOM.createPortal(this.renderLightbox(), this.state.element)
      : null
  }

  show = event => {
    this.setState({ shown: true })
  }

  render() {
    const { children } = this.props
    const modifiedChildren = React.Children.map(children, child =>
      React.cloneElement(child as any, {
        style: { cursor: "zoom-in" },
        onClick: this.show,
      })
    )
    return (
      <React.Fragment>
        {this.state.shown && this.renderPortal()}
        {modifiedChildren}
      </React.Fragment>
    )
  }

  initSeaDragon = () => {
    const viewer = OpenSeaDragon({
      element: this.state.deepZoomRef.current,

      debugMode: false,
      showNavigationControl: false,
      immediateRender: false,
      useCanvas: true,
      constrainDuringPan: false,
      blendTime: 0.0,
      animationTime: 1.5,
      springStiffness: 15.0,
      maxZoomPixelRatio: 1.0,
      minZoomImageRatio: 0.9,
      zoomPerClick: 1.4,
      zoomPerScroll: 1.4,
      clickDistThreshold: 5,
      clickTimeThreshold: 300,
      visibilityRatio: 1,
      tileSources: this.props.deepZoom,

      gestureSettingsTouch: {
        scrolltozoom: false,
        clicktozoom: true,
        pinchtozoom: true,
        flickenabled: true,
        flickminspeed: 20,
        flickmomentum: 0.4,
      },
    })
    this.setState({ viewer })
    return viewer
  }

  postRender = () => {
    this.state.viewer.addHandler("zoom", bind(throttle(this.onZoom, 50), this))
    this.state.viewer.addHandler(
      "tile-drawn",
      once(() => {
        this.setState({
          slider: {
            ...this.state.slider,
            min: this.state.viewer.viewport.getMinZoom(),
            max: this.state.viewer.viewport.getMaxZoom(),
            value: this.state.viewer.viewport.getHomeZoom(),
          },
        })
      })
    )
  }

  onZoom = () => {
    this.setState({
      slider: {
        ...this.state.slider,
        value: this.state.viewer.viewport.getZoom(),
      },
    })
  }

  componentDidMount() {
    this.setState({
      element: document.getElementById("lightbox-container"),
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.shown === true && prevState.shown === false) {
      this.initSeaDragon()
    }
    if (this.state.viewer && !prevState.viewer) {
      this.postRender()
    }
  }
}
