import { useT } from '../../i18n'
import type { FC } from 'react'
import { useState } from 'react'
import {
  Button,
  FileTrigger,
  Label,
  TextArea,
  TextField
} from 'react-aria-components'
import { Link } from 'react-router-dom'
import { changeTitle } from '../../utils/changeTitle'
import { useChips } from '../../utils/chips/useChips'
import {
  addRecipes,
  catalogue,
  library,
  removeImported
} from '../../utils/library/recipeLibrary'
import { shoppingListCsv } from '../../utils/transfer/csv'
import { download } from '../../utils/transfer/download'
import { chosenFiles, readFile } from '../../utils/transfer/files'
import type { ImportResult } from '../../utils/transfer/jsonld'
import { exportRecipes, importRecipes } from '../../utils/transfer/jsonld'
import { IMPORTED_PREFIX } from '../../utils/transfer/storage'
import { ACTION_BUTTON } from '../List/Filters'

const JSON_LD = 'application/ld+json'

const ExportSection: FC = () => {
  const t = useT()
  const { chips, pickedIds } = useChips()
  const picked = library.filter((recipe) => pickedIds.has(recipe.id))
  return (
    <section
      aria-labelledby="transfer-export"
      className="flex flex-col gap-3"
    >
      <h2
        id="transfer-export"
        className="text-lg font-semibold text-text"
      >
        {t('transfer.exportHeading')}
      </h2>
      <p className="text-sm text-muted">{t('transfer.exportHint')}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          className={ACTION_BUTTON}
          isDisabled={picked.length === 0}
          onPress={() =>
            download(
              'ingre-recipes.json',
              JSON_LD,
              exportRecipes(picked, catalogue)
            )
          }
        >
          {t('transfer.exportPicked')}
        </Button>
        <Button
          className={ACTION_BUTTON}
          onPress={() =>
            download(
              'ingre-all-recipes.json',
              JSON_LD,
              exportRecipes(library, catalogue)
            )
          }
        >
          {t('transfer.exportAll')}
        </Button>
        <Button
          className={ACTION_BUTTON}
          isDisabled={chips.length === 0}
          onPress={() =>
            download(
              'ingre-shopping-list.csv',
              'text/csv',
              shoppingListCsv(chips)
            )
          }
        >
          {t('transfer.exportList')}
        </Button>
      </div>
    </section>
  )
}

const Outcome: FC<{ result: ImportResult | null }> = ({ result }) => {
  const t = useT()
  if (result === null) return null
  if (!result.ok) return <p role="status">{t(`transfer.${result.reason}`)}</p>
  return (
    <div
      role="status"
      className="flex flex-col gap-1 text-sm text-text"
    >
      {result.recipes.map(({ recipe, unmatched }) => (
        <div key={recipe.id}>
          <p>
            {t('transfer.added', {
              name: recipe.name,
              matched: recipe.ingredients.length,
              total: recipe.ingredients.length + unmatched.length
            })}
          </p>
          {unmatched.length > 0 && (
            <p className="text-muted">
              {t('transfer.unmatched', { lines: unmatched.join('; ') })}
            </p>
          )}
        </div>
      ))}
      {result.skipped.length > 0 && (
        <p className="text-muted">
          {t('transfer.skipped', { names: result.skipped.join('; ') })}
        </p>
      )}
    </div>
  )
}

const ImportSection: FC<{ onChange: () => void }> = ({ onChange }) => {
  const t = useT()
  const [pasted, setPasted] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const run = (text: string) => {
    const next = importRecipes(text, catalogue)
    if (next.ok) addRecipes(next.recipes.map(({ recipe }) => recipe))
    setResult(next)
    onChange()
  }
  return (
    <section
      aria-labelledby="transfer-import"
      className="flex flex-col gap-3"
    >
      <h2
        id="transfer-import"
        className="text-lg font-semibold text-text"
      >
        {t('transfer.importHeading')}
      </h2>
      <p className="text-sm text-muted">{t('transfer.importHint')}</p>
      <FileTrigger
        acceptedFileTypes={['.json', '.jsonld', JSON_LD, 'application/json']}
        onSelect={(files) =>
          chosenFiles(files).forEach((file) => readFile(file).then(run))
        }
      >
        <Button className={`${ACTION_BUTTON} self-start`}>
          {t('transfer.chooseFile')}
        </Button>
      </FileTrigger>
      <TextField
        value={pasted}
        onChange={setPasted}
        className="flex flex-col gap-1"
      >
        <Label className="text-sm text-text">{t('transfer.pasteLabel')}</Label>
        <TextArea
          rows={5}
          className="rounded-control border border-border bg-surface p-2 font-mono text-sm text-text data-[focus-visible]:focus-ring"
        />
      </TextField>
      <Button
        className={`${ACTION_BUTTON} self-start`}
        isDisabled={pasted.trim() === ''}
        onPress={() => run(pasted)}
      >
        {t('transfer.importPasted')}
      </Button>
      <Outcome result={result} />
    </section>
  )
}

const ImportedList: FC<{ onChange: () => void }> = ({ onChange }) => {
  const t = useT()
  const imported = library.filter((recipe) =>
    recipe.id.startsWith(IMPORTED_PREFIX)
  )
  return (
    <section
      aria-labelledby="transfer-imported"
      className="flex flex-col gap-2"
    >
      <h2
        id="transfer-imported"
        className="text-lg font-semibold text-text"
      >
        {t('transfer.importedHeading')}
      </h2>
      {imported.length === 0 && (
        <p className="text-sm text-muted">{t('transfer.none')}</p>
      )}
      <ul className="flex flex-col gap-2">
        {imported.map((recipe) => (
          <li
            key={recipe.id}
            className="flex items-center justify-between gap-2 text-text"
          >
            <span>{recipe.name}</span>
            <Button
              className={ACTION_BUTTON}
              aria-label={t('transfer.remove', { name: recipe.name })}
              onPress={() => {
                removeImported(recipe.id)
                onChange()
              }}
            >
              ×
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Import and export (#230): recipes as JSON-LD, the shopping list as CSV. */
export const Transfer: FC = () => {
  const t = useT()
  const [, setVersion] = useState(0)
  changeTitle(`ingré · ${t('transfer.title')}`)
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold text-text">{t('transfer.title')}</h1>
      <Link
        to="/"
        className="text-primary underline"
      >
        {t('transfer.back')}
      </Link>
      <ExportSection />
      <ImportSection onChange={() => setVersion((v) => v + 1)} />
      <ImportedList onChange={() => setVersion((v) => v + 1)} />
    </div>
  )
}
