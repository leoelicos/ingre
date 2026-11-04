import { useState } from 'react'

/** Business logic for FAQ accordion: single open item. */
export const useFaqAccordion = () => {
  const [openId, setOpenId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id))
  }

  const isOpen = (id: string) => openId === id

  return { openId, toggle, isOpen }
}
