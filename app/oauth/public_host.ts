import { lookup } from 'node:dns/promises'
import { BlockList } from 'node:net'

const PRIVATE_RANGES = new BlockList()
PRIVATE_RANGES.addSubnet('0.0.0.0', 8)
PRIVATE_RANGES.addSubnet('10.0.0.0', 8)
PRIVATE_RANGES.addSubnet('100.64.0.0', 10)
PRIVATE_RANGES.addSubnet('127.0.0.0', 8)
PRIVATE_RANGES.addSubnet('169.254.0.0', 16)
PRIVATE_RANGES.addSubnet('172.16.0.0', 12)
PRIVATE_RANGES.addSubnet('192.168.0.0', 16)
PRIVATE_RANGES.addSubnet('::', 128, 'ipv6')
PRIVATE_RANGES.addSubnet('::1', 128, 'ipv6')
PRIVATE_RANGES.addSubnet('fc00::', 7, 'ipv6')
PRIVATE_RANGES.addSubnet('fe80::', 10, 'ipv6')

/**
 * A client identified by a metadata document makes the server fetch an
 * URL it chose: refuse hosts that resolve inside the private network
 * (the database, the Docker services) to keep that fetch from reaching
 * them.
 */
export async function resolvesToPublicAddresses(hostname: string) {
  const addresses = await lookup(hostname, { all: true }).catch(() => [])

  return (
    addresses.length > 0 &&
    addresses.every(
      ({ address, family }) => !PRIVATE_RANGES.check(address, family === 6 ? 'ipv6' : 'ipv4')
    )
  )
}
