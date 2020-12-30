import { List } from 'immutable'
import React, { Component } from 'react'
import { TagBox } from "react-tag-box"
import { animateScroll } from "react-scroll";

const sampleTags = List(
  ['cute', 'type beat', 'beats', 'hivemind', 'internetboy', 'anime beats', 'tiktok beats'].map(t => ({
    label: t,
    value: t
  }))
)

export default class BackspaceDeletion extends Component {
  componentDidMount() {
      this.scrollToBottom();
  }
  componentDidUpdate() {
      this.scrollToBottom();
  }
  scrollToBottom() {
      animateScroll.scrollToBottom({
        duration: 200,
        delay: 0,
        smooth: 'easeInOutQuint',
        containerId: "tagPills"
      });
  }
  state = {
    tags: sampleTags,
    selected: sampleTags
  }

  render() {
    const { tags, selected } = this.state
    const onSelect = tag => {
      console.log("new tag or something");
      const newTag = {
        label: tag.label,
        value: tag.value || tag.label
      }

      this.setState({
        selected: selected.push(newTag)
      })
    }

    const remove = tag => {
      this.setState({
        selected: selected.filter(t => t.value !== tag.value)
      })
    }

    const placeholder = selected.isEmpty() ? '' :
      "Tag..."

    return (
      <TagBox
        tags={tags.toJS()}
        selected={selected.toJS()}
        onSelect={onSelect}
        removeTag={remove}
        backspaceDelete={true}
        placeholder={placeholder}
      />
    )
  }
}
