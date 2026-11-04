import {
  Button,
  ToggleButton,
  Tooltip,
  TooltipTrigger,
  Switch,
  Label,
  Radio,
  RadioGroup,
  Input,
  SearchField,
  Slider,
  SliderThumb,
  SliderTrack
} from '../aria'

it('re-exports the React Aria primitives', () => {
  expect(Button).toBeDefined()
  expect(ToggleButton).toBeDefined()
  expect(Tooltip).toBeDefined()
  expect(TooltipTrigger).toBeDefined()
  expect(Switch).toBeDefined()
  expect(Label).toBeDefined()
  expect(Radio).toBeDefined()
  expect(RadioGroup).toBeDefined()
  expect(Input).toBeDefined()
  expect(SearchField).toBeDefined()
  expect(Slider).toBeDefined()
  expect(SliderThumb).toBeDefined()
  expect(SliderTrack).toBeDefined()
})
