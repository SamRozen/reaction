import { get, once } from "lodash"
import React from "react"
import styled, { StyledFunction } from "styled-components"
import Colors from "../../../Assets/Colors"
import { crop, resize } from "../../../Utils/resizer"
import { track } from "../../../Utils/track"
import { Fonts } from "../Fonts"

interface DisplayPanelProps extends React.HTMLProps<HTMLDivElement> {
  unit: any
  campaign: any
}

interface DivUrlProps extends React.HTMLProps<HTMLDivElement> {
  imageUrl?: string
  hoverImageUrl?: string
  coverUrl?: string
  onMouseEnter: any
  onMouseLeave: any
}

@track()
export class DisplayPanel extends React.Component<DisplayPanelProps, null> {
  private video: HTMLVideoElement

  constructor(props) {
    super(props)
    this.openLink = this.openLink.bind(this)
  }

  @track(once(props => ({
    action: "Impression",
    entity_type: "display_ad",
    campaign_name: props.campaign.name,
    unit_layout: "panel"
  })))
  // tslint:disable-next-line:no-empty
  componentDidMount() { }

  // Rather than using an <a /> tag, which bad markup can oftentimes break during
  // SSR, use JS to open link.
  @track((props, [e]) => ({
    action: "Click",
    label: "Display ad clickthrough",
    entity_type: "display_ad",
    campaign_name: props.campaign.name,
    unit_layout: "panel"
  }))
  openLink(e) {
    e.preventDefault()
    window.open(this.props.unit.link.url, '_blank')
  }

  onMouseEnter = () => {
    if (this.video) {
      if (this.video.paused) {
        this.video.play()
      } else {
        this.video.pause()
      }
    }
  }

  onMouseLeave = () => {
    if (this.video) {
      this.video.pause()
    }
  }

  renderVideo = (url) => {
    return (
      <VideoContainer>
        <VideoCover />
        <video src={url} controls={false} playsInline ref={video => (this.video = video)} />
      </VideoContainer>
    )
  }


  render() {
    const { unit, campaign } = this.props
    const url = get(unit.assets, '0.url', '')
    const cover = get(unit.assets, '1.url', '')
    const imageUrl = crop(url, { width: 680, height: 284 })
    const hoverImageUrl = resize(unit.logo, { width: 680 })
    const coverUrl = crop(cover, { width: 680, height: 284 })
    const isVideo = url.includes("mp4")

    return (
      <Wrapper onClick={this.openLink}>
        <DisplayPanelContainer
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          imageUrl={imageUrl}
          hoverImageUrl={hoverImageUrl}
          coverUrl={coverUrl}>

          {isVideo
            ? this.renderVideo(url)
            : <Image />
          }

          <Headline>
            {unit.headline}
          </Headline>

          <Body dangerouslySetInnerHTML={{
            __html: unit.body
          }} />

          <SponsoredBy>
            {`Sponsored by ${campaign.name}`}
          </SponsoredBy>
        </DisplayPanelContainer>
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  cursor: pointer;
  text-decoration: none;
  color: black;
  margin-top: 50px;
`

const Image = styled.div`
  margin-bottom: 15px;
  width: 100%;
  height: 142px;
  background-color: black;
  box-sizing: border-box;
`

const VideoCover = Image.extend`
  position: absolute;
`

const Div: StyledFunction<DivUrlProps> = styled.div

const DisplayPanelContainer = Div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${Colors.grayRegular};
  padding: 20px;
  max-width: 360px;
  box-sizing: border-box;
  ${Image} {
    background: url(${props => (props.imageUrl ? props.imageUrl : "")}) no-repeat center center;
    background-size: cover;
  }
  ${VideoCover} {
    background: url(${props => (props.coverUrl ? props.coverUrl : "")}) no-repeat center center;
    background-size: cover;
  }
  &:hover {
    ${Image} {
      ${props =>
    props.hoverImageUrl
      ? `
          background: black url(${props.hoverImageUrl}) no-repeat center center;
          background-size: contain;
          border: 10px solid black;
        `
      : ""}
    }
    ${VideoCover} {
      display: none;
    }
  }
`

const Headline = styled.div`
  ${Fonts.unica("s16", "medium")} line-height: 1.23em;
  margin-bottom: 3px;
`

const Body = styled.div`
  ${Fonts.garamond("s17")} line-height: 1.53em;
  margin-bottom: 20px;
  a {
    color: black;
  }
`

const SponsoredBy = styled.div`
  ${Fonts.avantgarde("s11")} color: ${Colors.grayRegular};
`

const VideoContainer = Image.extend`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  video {
    object-fit: cover;
    object-position: 50%;
    width: 100%;
  }
`