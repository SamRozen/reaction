import * as React from "react"
import styled, { StyledFunction } from "styled-components"
import { pMedia } from "../helpers"

interface FillwidthItemProps extends React.HTMLProps<HTMLDivElement> {
  margin?: number
  key: string
  width?: number
}

const div: StyledFunction<FillwidthItemProps & React.HTMLProps<HTMLDivElement>> = styled.div

export default div`
  display: inline-block;
  margin-right: ${props => (props.margin ? props.margin + "px" : "0px")};
  width: ${props => (props.width ? props.width + "px" : "100%")};
  ${pMedia.sm`
    margin-bottom: 10px;
  `}
`
