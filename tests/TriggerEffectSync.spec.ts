import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { OutputStruct as DualSenseOutputStruct } from '@/router/DualSense/views/_OutputPanel/outputStruct'
import DualSenseTriggerEffect from '@/router/DualSense/views/_OutputPanel/TriggerEffect.vue'
import { OutputStruct as DualSenseEdgeOutputStruct } from '@/router/DualSenseEdge/views/_OutputPanel/outputStruct'
import DualSenseEdgeTriggerEffect from '@/router/DualSenseEdge/views/_OutputPanel/TriggerEffect.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('@/components/base/DouSelect.vue', () => ({
  default: {
    name: 'DouSelect',
    props: ['modelValue', 'options'],
    emits: ['update:modelValue'],
    template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', Number($event.target.value))" />',
  },
}))

vi.mock('@/components/common/SliderBox.vue', () => ({
  default: {
    name: 'SliderBox',
    props: ['modelValue', 'min', 'max'],
    emits: ['update:modelValue'],
    template: '<input type="range" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
  },
}))

function mountTriggerEffect(component: any, struct: any, is: 'left' | 'right' | 'both') {
  return mount(component, {
    props: { is, struct },
    global: {
      mocks: {
        $t: (key: string) => key,
      },
    },
  })
}

describe.each([
  { name: 'DualSense', component: DualSenseTriggerEffect, Struct: DualSenseOutputStruct },
  { name: 'DualSenseEdge', component: DualSenseEdgeTriggerEffect, Struct: DualSenseEdgeOutputStruct },
])('$name TriggerEffect sync', ({ component, Struct }) => {
  it('controls both left and right trigger mode and resistance sliders simultaneously when is="both"', async () => {
    const struct = new Struct()
    const wrapper = mountTriggerEffect(component, struct, 'both')

    expect(wrapper.text()).toContain('output_panel.both_trigger_mode')

    const select = wrapper.findComponent({ name: 'DouSelect' })
    select.vm.$emit('update:modelValue', 0x01)
    await nextTick()

    expect(struct.adaptiveTriggerLeftMode.value).toBe(0x01)
    expect(struct.adaptiveTriggerRightMode.value).toBe(0x01)
    expect(struct.adaptiveTriggerLeftParam0.value).toBe(40)
    expect(struct.adaptiveTriggerRightParam0.value).toBe(40)
    expect(struct.adaptiveTriggerLeftParam1.value).toBe(230)
    expect(struct.adaptiveTriggerRightParam1.value).toBe(230)

    const sliders = wrapper.findAllComponents({ name: 'SliderBox' })
    expect(sliders).toHaveLength(2)

    sliders[0]!.vm.$emit('update:modelValue', 110)
    sliders[1]!.vm.$emit('update:modelValue', 195)
    await nextTick()

    expect(struct.adaptiveTriggerLeftParam0.value).toBe(110)
    expect(struct.adaptiveTriggerRightParam0.value).toBe(110)
    expect(struct.adaptiveTriggerLeftParam1.value).toBe(195)
    expect(struct.adaptiveTriggerRightParam1.value).toBe(195)
    expect(wrapper.emitted('effectUpdate')?.length).toBeGreaterThan(0)
  })

  it('preserves existing struct parameters when mounted in non-off mode', async () => {
    const struct = new Struct()
    struct.adaptiveTriggerLeftMode.value = 0x01
    struct.adaptiveTriggerLeftParam0.value = 88
    struct.adaptiveTriggerLeftParam1.value = 175
    struct.adaptiveTriggerRightMode.value = 0x01
    struct.adaptiveTriggerRightParam0.value = 88
    struct.adaptiveTriggerRightParam1.value = 175

    const wrapper = mountTriggerEffect(component, struct, 'both')
    await nextTick()

    const sliders = wrapper.findAllComponents({ name: 'SliderBox' })
    expect(sliders).toHaveLength(2)
    expect(sliders[0]!.props('modelValue')).toBe(88)
    expect(sliders[1]!.props('modelValue')).toBe(175)
  })
})
