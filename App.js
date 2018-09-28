import React from 'react'
import { Animated, Easing, PanResponder, ScrollView, StyleSheet, Text, View } from 'react-native'

const texts = Array.from({ length: 200 }).map((e, i) => `this.panResponder.panHandlers #${i}`)

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.width = new Animated.Value(1)

    const translateY = this.width.interpolate({
      inputRange: [0, 1],
      outputRange: [600, 100],
      extrapolate: 'clamp',
      useNativeDriver: true
    })

    this.inner = [
      styles.inner, {
        transform: [{ translateY }]
      }
    ]

    this.panResponder = PanResponder.create({
      //onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: this.canMove,
      onMoveShouldSetPanResponderCapture: this.canMove,
      onPanResponderMove: this.onMove,
      onPanResponderRelease: this.onPanResponderRelease,
      onPanResponderTerminate: this.onPanResponderTerminate,
      onPanResponderGrant: this.onPanResponderGrant
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Animated.View style={this.inner} {...this.panResponder.panHandlers}>
          <ScrollView
            style={{ backgroundColor: 'blue' }}
            onScroll={this.onScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={this.onMomentumScrollEnd}
            ref={this.refList}
          >
            {texts.map((row) => <Text key={row}>{row}</Text>)}
          </ScrollView>
        </Animated.View>
      </View>
    )
  }

  refList = (ref) => {
    this.list = ref
  }

  scrollPosition = 0

  scrollEnabled = true

  onScroll = (e) => {
    this.scrollPosition = e.nativeEvent.contentOffset.y
    console.log(this.scrollPosition)
    if (this.scrollPosition < -10) {
      const dist = Math.max(0, 1 - Math.abs(this.scrollPosition) / 500)
      this.width.setValue(dist)
      // if (this.scrollEnabled) {
      //   this.list.setNativeProps({ scrollEnabled: false })
      //   this.scrollEnabled = false
      // }
    }
  }

  canMove = (e, { dy }) => {
    console.log('canMove')
    if (this.scrollPosition > 10) {
      return false
    }


    if (Math.abs(dy) > 10) {
      if (dy > 0 && this.width.__getValue() === 0) {
        return false
      }

      if (dy < 0 && this.width.__getValue() === 1) {
        return false
      }
      return true
    }

    return false
  }

  onMomentumScrollEnd = () => {
    this.width.flattenOffset()
  }

  onMove = (e, { dy }) => {
    const distance = 600 - 100
    if (this.direction === 'up') {
      const dist = Math.min(1, -dy / distance)
      this.width.setValue(dist)
    } else if (this.direction === 'down') {
      const dist = Math.max(0, 1 - dy / distance)
      this.width.setValue(dist)
    }
  }

  onPanResponderGrant = () => {
    this.direction = Math.round(this.width.__getValue()) === 0 ? 'up' : 'down'
  }

  onPanResponderTerminate = () => {
    this.width.flattenOffset()

    Animated.timing(this.width, {
      toValue: 1,
      duration: 250,
      easing: Easing.bezier(0.68, 0.39, 0.76, 1.2)
    }).start()
  }

  onPanResponderRelease = (e, { dy, vy }) => {
    console.log('dyx', dy)
    if (dy < 150) {
      this.onPanResponderTerminate()
    } else {
      const duration = 350 / Math.max(Math.abs(vy), 1)
      this.width.flattenOffset()
      Animated.timing(this.width, {
        toValue: 0,
        duration,
        easing: Easing.bezier(.68, .39, .76, 1.2)
      }).start()
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'green',
  },
  inner: {
    backgroundColor: 'tomato',
    flex: 1
  }
})
