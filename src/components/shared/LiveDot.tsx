export function LiveDot() {
  return (
    <span
      className="inline-block rounded-full shrink-0"
      style={{
        width: 7,
        height: 7,
        background: '#34D399',
        animation: 'blink 1.4s ease-in-out infinite',
      }}
    />
  )
}

export default LiveDot
