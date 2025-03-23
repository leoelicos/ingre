import React, { FC } from 'react'
import NotLoggedIn from 'components/NotLoggedIn'
import { useAuthContext } from 'utils/auth/AuthContext'
import {
  IngreIconAddIngredient,
  IngreIconClearCustom,
  IngreIconRemove,
  IngreIconSave,
  IngreIconUndoCustom
} from 'lib/icon/Icon'
import { useCustomise } from './useCustomise.ts'

const Customise: FC = () => {
  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn
  const {
    onFinish,
    setFields,
    fields,
    handleClearAll,
    handleUndoAll,
    saved,
    loading,
    handleBack
  } = useCustomise()

  return (
    <div>
      <p>Customise</p>
      <div>
        {!loggedIn ? (
          <NotLoggedIn />
        ) : (
          <form onSubmit={onFinish}>
            <div>
              <div>
                <div>
                  <p>Recipe Name</p>
                  <p>Portions</p>
                </div>
                <div>
                  <div>
                    <input
                      type="text"
                      placeholder="Recipe name ✏️"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFields((prev) => ({ ...prev, name: e.target.value }))
                      }}
                    />

                    <div>
                      <input
                        type="text"
                        placeholder="Recipe Portions ✏️"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFields((prev) => ({
                            ...prev,
                            portions: e.target.value
                          }))
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ingredients */}
            <div>
              <div>
                <table>
                  <tbody>
                    <tr>
                      <th>Ingredient</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Category</th>
                    </tr>
                    {fields.ingredients.map(
                      ({ name, quantity, measure, category }, idx) => (
                        <tr>
                          <td>
                            <input
                              value={name}
                              onChange={(e) => {}}
                            />
                          </td>
                          <td>
                            <input
                              value={quantity}
                              onChange={(e) => {}}
                            />
                          </td>
                          <td>
                            <input
                              value={measure}
                              onChange={(e) => {}}
                            />
                          </td>
                          <td>
                            <input
                              value={category}
                              onChange={(e) => {}}
                            />
                          </td>
                          v
                          <td>
                            <button
                              onClick={() => {
                                // setFields
                              }}
                            >
                              <IngreIconRemove /> Delete ingredient
                            </button>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                // setFields
                              }}
                            >
                              <IngreIconAddIngredient /> Add ingredient
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div>
                <button onClick={handleClearAll}>
                  <IngreIconClearCustom /> Clear all
                </button>
                <button onClick={handleUndoAll}>
                  <IngreIconUndoCustom /> Undo all
                </button>
                <button
                  disabled={saved}
                  type="submit"
                >
                  {loading ? (
                    <>Saving…</>
                  ) : saved ? (
                    <>Saved!</>
                  ) : (
                    <>
                      <IngreIconSave /> <>Save</>
                    </>
                  )}
                </button>
                <button
                  disabled={saved}
                  onClick={handleBack}
                >
                  Go back
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
export default Customise
