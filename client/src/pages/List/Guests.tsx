import { useT } from '../../i18n'
import type { FC } from 'react'
import { useState } from 'react'
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Label,
  TextField
} from 'react-aria-components'
import { Collapse } from '../../components/Collapse'
import { useGuestActions, useGuestList } from '../../utils/guests/GuestsContext'
import { guestsCaption } from '../../utils/guests/guests'
import type { Guest } from '../../utils/guests/guests'
import { FSANZ_ALLERGENS } from '../../utils/library/fsanz'
import { ACTION_BUTTON, BOX, CheckMark, PANEL } from './Filters'

/** The Guests button in Explore's actions row; it opens the guest profiles inline (#209). */
export const GuestsButton: FC<{
  panelId: string
  open: boolean
  onPress: () => void
}> = ({ panelId, open, onPress }) => (
  <Button
    aria-expanded={open}
    aria-controls={panelId}
    onPress={onPress}
    className={ACTION_BUTTON}
  >
    {guestsCaption(useGuestList())}
  </Button>
)

const GuestCard: FC<{ guest: Guest }> = ({ guest }) => {
  const t = useT()
  const { remove, setAllergens } = useGuestActions()
  return (
    <li className="flex flex-col gap-2 rounded-control border border-border p-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="m-0 text-base font-bold">{guest.name}</h3>
        <Button
          aria-label={t('guests.remove', { name: guest.name })}
          onPress={() => remove(guest.id)}
          className={ACTION_BUTTON}
        >
          {t('filter.clear')}
        </Button>
      </div>
      <CheckboxGroup
        value={[...guest.allergens]}
        onChange={(next) => setAllergens(guest.id, next)}
        className="flex flex-col gap-1"
      >
        <Label className="text-sm font-semibold">
          {t('guests.allergensFor', { name: guest.name })}
        </Label>
        <div className="flex flex-wrap gap-2">
          {FSANZ_ALLERGENS.map((allergen) => (
            <Checkbox
              key={allergen}
              value={allergen}
              className={BOX}
            >
              {({ isSelected }) => (
                <>
                  <CheckMark on={isSelected} />
                  {allergen}
                </>
              )}
            </Checkbox>
          ))}
        </div>
      </CheckboxGroup>
    </li>
  )
}

const AddGuest: FC = () => {
  const t = useT()
  const { add } = useGuestActions()
  const [name, setName] = useState('')
  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        add(name)
        setName('')
      }}
    >
      <TextField
        value={name}
        onChange={setName}
        className="flex min-w-0 flex-1 flex-col gap-1"
      >
        <Label className="text-sm font-semibold">{t('guests.name')}</Label>
        <Input
          autoComplete="off"
          className="min-h-[44px] w-full min-w-0 rounded-control border border-border bg-surface px-3 text-base text-text data-[focus-visible]:focus-ring"
        />
      </TextField>
      <Button
        type="submit"
        className={ACTION_BUTTON}
      >
        {t('guests.add')}
      </Button>
    </form>
  )
}

/** The guest profiles (#209): who is at the table and which allergens each one has. */
export const GuestsPanel: FC<{ id: string; open: boolean }> = ({
  id,
  open
}) => {
  const t = useT()
  const guests = useGuestList()
  return (
    <Collapse
      id={id}
      open={open}
    >
      <div
        role="group"
        aria-label={t('guests.panel')}
        className={PANEL}
      >
        {guests.length === 0 ? (
          <p className="m-0 text-text-secondary">{t('guests.hint')}</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {guests.map((guest) => (
              <GuestCard
                key={guest.id}
                guest={guest}
              />
            ))}
          </ul>
        )}
        <AddGuest />
      </div>
    </Collapse>
  )
}
