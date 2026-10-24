import type { FC, ReactNode } from 'react'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  ComboBox,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Tag,
  TagGroup,
  TagList
} from 'react-aria-components'
import { Collapse } from '../../components/Collapse'
import { categoryLabel } from '../../utils/chips/chips'
import type {
  ChipFilter,
  ChipStatus,
  RecipeFilter
} from '../../utils/filters/filters'
import { STATUS_LABELS, hiddenText } from '../../utils/filters/filters'
import { SHOP_SECTIONS } from '../../utils/shopping/sections'
import { displayName } from '../../utils/shopping/shoppingList'
import { SavedFilter } from './SavedFilter'

export const ACTION_BUTTON =
  'inline-flex min-h-[44px] items-center rounded-pill border-2 border-primary px-4 text-sm font-semibold text-primary data-[focus-visible]:focus-ring data-[pressed]:opacity-80'

/** "Filter", or "Filter (2)" while two values are ticked. */
export const filterButtonText = (active: number): string =>
  active === 0 ? 'Filter' : `Filter (${active})`

/** The Filter button in a section's actions row; it opens the panel inline. */
export const FilterButton: FC<{
  panelId: string
  open: boolean
  active: number
  onPress: () => void
}> = ({ panelId, open, active, onPress }) => (
  <Button
    aria-expanded={open}
    aria-controls={panelId}
    onPress={onPress}
    className={ACTION_BUTTON}
  >
    {filterButtonText(active)}
  </Button>
)

/** The row of actions just below a section's header button (#182). */
export const ActionsRow: FC<{ label: string; children: ReactNode }> = ({
  label,
  children
}) => (
  <div
    role="toolbar"
    aria-label={label}
    className="flex flex-wrap items-center gap-2"
  >
    {children}
  </div>
)

const PANEL =
  'flex flex-col gap-3 rounded-card border-2 border-border bg-surface p-3 text-text'

const BOX =
  'inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-pill border border-border px-3 text-sm data-[selected]:border-2 data-[selected]:border-primary data-[selected]:font-bold data-[focus-visible]:focus-ring'

const CheckMark: FC<{ on: boolean }> = ({ on }) => (
  <span
    aria-hidden="true"
    className="inline-flex h-5 w-5 items-center justify-center rounded-[5px] border-2 border-current text-xs"
  >
    {on ? '✓' : ''}
  </span>
)

/** One filter group of checkboxes: any ticked value matches. */
const CheckGroup: FC<{
  label: string
  options: readonly { value: string; label: string }[]
  value: readonly string[]
  onChange: (value: string[]) => void
}> = ({ label, options, value, onChange }) => (
  <CheckboxGroup
    value={[...value]}
    onChange={onChange}
    className="flex flex-col gap-1"
  >
    <Label className="text-sm font-semibold">{label}</Label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Checkbox
          key={option.value}
          value={option.value}
          className={BOX}
        >
          {({ isSelected }) => (
            <>
              <CheckMark on={isSelected} />
              {option.label}
            </>
          )}
        </Checkbox>
      ))}
    </div>
  </CheckboxGroup>
)

/** The chip filter (#182): category and status. */
export const ChipFilterPanel: FC<{
  id: string
  open: boolean
  label: string
  statuses: readonly ChipStatus[]
  filter: ChipFilter
  onChange: (filter: ChipFilter) => void
}> = ({ id, open, label, statuses, filter, onChange }) => (
  <Collapse
    id={id}
    open={open}
  >
    <div
      role="group"
      aria-label={label}
      className={PANEL}
    >
      <CheckGroup
        label="Category"
        options={SHOP_SECTIONS.map((section) => ({
          value: section,
          label: categoryLabel(section)
        }))}
        value={[...filter.sections]}
        onChange={(value) =>
          onChange({
            ...filter,
            sections: new Set(
              SHOP_SECTIONS.filter((section) => value.includes(section))
            )
          })
        }
      />
      <CheckGroup
        label="Status"
        options={statuses.map((status) => ({
          value: status,
          label: STATUS_LABELS[status]
        }))}
        value={[...filter.statuses]}
        onChange={(value) =>
          onChange({
            ...filter,
            statuses: new Set(statuses.filter((s) => value.includes(s)))
          })
        }
      />
    </div>
  </Collapse>
)

/** An ingredient a recipe filter can name. */
export interface FilterOption {
  readonly id: string
  readonly name: string
}

/**
 * Pick several ingredients (#182): a combo box adds one at a time, and each shows as a tag
 * that can be removed.
 */
const IngredientPicker: FC<{
  label: string
  options: readonly FilterOption[]
  value: readonly string[]
  onChange: (value: string[]) => void
}> = ({ label, options, value, onChange }) => {
  const nameOf = (id: string) =>
    displayName({ name: options.find((o) => o.id === id)?.name ?? id })
  return (
    <div className="flex flex-col gap-1">
      <ComboBox
        selectedKey={null}
        onSelectionChange={(key) =>
          options
            .filter((option) => option.id === key)
            .forEach((option) => onChange([...value, option.id]))
        }
        menuTrigger="focus"
        className="flex flex-col gap-1"
      >
        <Label className="text-sm font-semibold">{label}</Label>
        <Input className="h-11 rounded-control border border-border bg-surface px-3 text-text focus-visible:focus-ring" />
        <Popover className="max-h-60 w-[--trigger-width] overflow-y-auto rounded-control border border-border bg-surface text-text shadow-raised">
          <ListBox className="p-1 outline-none">
            {options
              .filter((option) => !value.includes(option.id))
              .map((option) => (
                <ListBoxItem
                  key={option.id}
                  id={option.id}
                  textValue={option.name}
                  className="min-h-[44px] cursor-pointer rounded-control px-3 py-2 data-[focused]:bg-chip-active"
                >
                  {displayName(option)}
                </ListBoxItem>
              ))}
          </ListBox>
        </Popover>
      </ComboBox>
      {value.length > 0 && (
        <TagGroup
          aria-label={`${label}: chosen`}
          onRemove={(keys) => onChange(value.filter((id) => !keys.has(id)))}
        >
          <TagList className="flex flex-wrap gap-2">
            {value.map((id) => (
              <Tag
                key={id}
                id={id}
                textValue={nameOf(id)}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-pill border border-border pl-3 text-sm data-[focus-visible]:focus-ring"
              >
                {nameOf(id)}
                <Button
                  slot="remove"
                  aria-label={`Remove ${nameOf(id)}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-pill data-[focus-visible]:focus-ring"
                >
                  <span aria-hidden="true">✕</span>
                </Button>
              </Tag>
            ))}
          </TagList>
        </TagGroup>
      )}
    </div>
  )
}

/** The recipe filter (#182): contains and excludes, plus Saved in Explore. */
export const RecipeFilterPanel: FC<{
  id: string
  open: boolean
  label: string
  options: readonly FilterOption[]
  /** Explore shows the Saved switch; Recipes doesn't */
  saved: boolean
  filter: RecipeFilter
  onChange: (filter: RecipeFilter) => void
}> = ({ id, open, label, options, saved, filter, onChange }) => (
  <Collapse
    id={id}
    open={open}
  >
    <div
      role="group"
      aria-label={label}
      className={PANEL}
    >
      {saved && (
        <SavedFilter
          on={filter.savedOnly}
          onChange={(savedOnly) => onChange({ ...filter, savedOnly })}
        />
      )}
      <IngredientPicker
        label="Contains"
        options={options}
        value={filter.contains}
        onChange={(contains) => onChange({ ...filter, contains })}
      />
      <IngredientPicker
        label="Excludes"
        options={options}
        value={filter.excludes}
        onChange={(excludes) => onChange({ ...filter, excludes })}
      />
    </div>
  </Collapse>
)

/** "3 hidden by filter" with Clear (#182); nothing when none is hidden. */
export const HiddenNote: FC<{ hidden: number; onClear: () => void }> = ({
  hidden,
  onClear
}) =>
  hidden === 0 ? null : (
    <div className="flex flex-wrap items-center gap-2">
      <p
        role="status"
        className="m-0 text-sm text-text-secondary"
      >
        {hiddenText(hidden)}
      </p>
      <Button
        onPress={onClear}
        className={ACTION_BUTTON}
      >
        Clear
      </Button>
    </div>
  )
