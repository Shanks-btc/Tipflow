'use client'
import { useState } from 'react'
import { MAX_TIP, MIN_TIP, PRESET_AMOUNTS } from '@/lib/constants'

interface AmountSelectorProps {
  selected: number | null
  onSelect: (amount: number) => void
}

export function AmountSelector({ selected, onSelect }: AmountSelectorProps) {
  const [custom, setCustom] = useState('')

  const handlePresetClick = (n: number) => {
    setCustom('')
    onSelect(n)
  }

  const handleCustomChange = (value: string) => {
    setCustom(value)
    const n = parseFloat(value)
    if (!isNaN(n) && n >= MIN_TIP && n <= MAX_TIP) {
      onSelect(n)
    }
  }

  return (
    <div>
      <div className="text-[11px] uppercase text-[var(--tm)] mb-2" style={{ letterSpacing: '0.06em' }}>
        Choose an amount
      </div>
      <div className="grid grid-cols-2 gap-[9px]">
        {PRESET_AMOUNTS.map((n) => {
          const isSelected = !custom && selected === n
          return (
            <button
              key={n}
              onClick={() => handlePresetClick(n)}
              className="w-full rounded-[10px] py-3.5 font-black text-[20px] border transition-colors"
              style={{
                background: isSelected ? 'var(--ord)' : 'var(--s1)',
                borderColor: isSelected ? 'var(--orb)' : 'var(--b)',
                color: isSelected ? 'var(--or)' : 'var(--t)',
              }}
            >
              ${n}
            </button>
          )
        })}
      </div>
      <input
        type="number"
        inputMode="decimal"
        placeholder="Custom amount"
        value={custom}
        onChange={(e) => handleCustomChange(e.target.value)}
        className="mt-3"
      />
    </div>
  )
}

export default AmountSelector
