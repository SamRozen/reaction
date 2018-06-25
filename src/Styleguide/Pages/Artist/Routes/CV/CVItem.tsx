import { Sans, Serif } from "@artsy/palette"
import { CVItem_artist } from "__generated__/CVItem_artist.graphql"
import { groupBy } from "lodash"
import React from "react"
import styled from "styled-components"
import { Box } from "Styleguide/Elements/Box"
import { Flex } from "Styleguide/Elements/Flex"
import { Col, Row } from "Styleguide/Elements/Grid"
import { Spacer } from "Styleguide/Elements/Spacer"
import { Responsive } from "Styleguide/Utils/Responsive"

import {
  createPaginationContainer,
  graphql,
  RelayPaginationProp,
} from "react-relay"

interface CVProps {
  relay: RelayPaginationProp
  artist: CVItem_artist
  category: string
}

export const PAGE_SIZE = 10

export const CVPaginationContainer = createPaginationContainer(
  class extends React.Component<CVProps> {
    loadMore() {
      const hasMore = this.props.artist.showsConnection.pageInfo.hasNextPage
      if (hasMore) {
        this.props.relay.loadMore(PAGE_SIZE, error => {
          if (error) {
            // tslint:disable-next-line:no-console
            console.log(error)
          }
        })
      }
    }

    renderPagination() {
      return (
        <div
          onClick={() => {
            this.loadMore()
          }}
        >
          Load More
        </div>
      )
    }

    renderShow(node, index) {
      return (
        <Show size="3" key={index}>
          <Serif size="3" display="inline" italic>
            <a href="#" className="noUnderline">
              {node.name}
            </a>
          </Serif>,{" "}
          <a href="#" className="noUnderline">
            {node.partner.name}
          </a>, {node.city}
        </Show>
      )
    }

    render() {
      const groupedByYear = groupBy(
        this.props.artist.showsConnection.edges,
        ({ node: show }) => {
          return show.start_at
        }
      )
      return (
        <Responsive>
          {({ xs }) => {
            return (
              <React.Fragment>
                <Row>
                  <Col>
                    <CVItems>
                      <CVItem>
                        <Row>
                          <Col sm={2}>
                            <Box mb={1}>
                              <Category size="3" weight="medium">
                                {this.props.category}
                              </Category>
                            </Box>
                          </Col>
                          <Col sm={10}>
                            {Object.keys(groupedByYear)
                              .sort()
                              .reverse()
                              .map((year, index) => {
                                return (
                                  <YearGroup mb={1} key={index}>
                                    <Year size="3">{year}</Year>
                                    <Spacer mr={xs ? 1 : 4} />
                                    <ShowGroup>
                                      {groupedByYear[year].map(
                                        ({ node }, key) => {
                                          return this.renderShow(node, key)
                                        }
                                      )}
                                    </ShowGroup>
                                  </YearGroup>
                                )
                              })}

                            <Spacer my={1} />
                            {this.renderPagination()}
                          </Col>
                        </Row>
                      </CVItem>
                    </CVItems>
                  </Col>
                </Row>
              </React.Fragment>
            )
          }}
        </Responsive>
      )
    }
  },
  {
    artist: graphql`
      fragment CVItem_artist on Artist
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 10 }
          cursor: { type: "String", defaultValue: "" }
          sort: { type: "PartnerShowSorts", defaultValue: "start_at_desc" }
          at_a_fair: { type: "Boolean", defaultValue: false }
          solo_show: { type: "Boolean", defaultValue: false }
          is_reference: { type: "Boolean", defaultValue: true }
          visible_to_public: { type: "Boolean", defaultValue: false }
        ) {
        id
        showsConnection(
          first: $count
          after: $cursor
          sort: $sort
          at_a_fair: $at_a_fair
          solo_show: $solo_show
          is_reference: $is_reference
          visible_to_public: $visible_to_public
        ) @connection(key: "Artist_showsConnection") {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
              __id
              partner {
                ... on ExternalPartner {
                  name
                }
                ... on Partner {
                  name
                }
              }
              name
              start_at(format: "YYYY")
              city
            }
          }
        }
      }
    `,
  },
  {
    direction: "forward",
    getConnectionFromProps(props) {
      return props.artist.showsConnection as any
    },
    getFragmentVariables(prevVars, totalCount) {
      return { ...prevVars, count: totalCount }
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
        ...fragmentVariables,
        count,
        cursor,
        artistID: props.artist.id,
      }
    },
    query: graphql`
      query CVItemQuery(
        $count: Int
        $cursor: String
        $artistID: String!
        $sort: PartnerShowSorts
        $at_a_fair: Boolean
        $solo_show: Boolean
        $is_reference: Boolean
        $visible_to_public: Boolean
      ) {
        artist(id: $artistID) {
          ...CVItem_artist
            @arguments(
              sort: $sort
              count: $count
              cursor: $cursor
              at_a_fair: $at_a_fair
              solo_show: $solo_show
              is_reference: $is_reference
              visible_to_public: $visible_to_public
            )
        }
      }
    `,
  }
)

const CVItems = styled.div``
const CVItem = Box
const YearGroup = styled(Flex)``
const Year = Serif
const ShowGroup = styled.div``
const Show = Serif
const Category = Sans