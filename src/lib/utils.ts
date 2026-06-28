import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the program/course image URL for a given branch slug.
 * Falls back to the civil engineering image for unknown branches.
 */
export function getProgramImage(branchSlug: string): string {
  switch (branchSlug) {
    case 'civil':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1zwIvsJyShDXvkg2QuS4UK5aYqA1iiqrI-7niuVokAGGrQHy5JXL8vik3aFIxUUZooV8HefabiK4k7ScvvoHIgU6ke03zenNNdzfj7dlrgF50MwVIzUbDHDDpGp7pegfzqrAob-hFOdrS-5vJ7I2msyXrxgMUK3UY-2KDAmPOUb1zaAgNmn-llePQsw7kwLZRHqWp8bfmv_DjSQrZ1jVrGTr0yqg3JFsKJUM73JYP_fF-2dxiEMB8PMZa_N9wuj0IgbovtGegz58'
    case 'mechanical':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvhSMqXf8G9pR6_b9ccZAMBGTZzLZoou1zzFiZe9L0XFdCkkMAIJy-T-VjrBRMIo5y-lPzfYNCJxyQ7588jjL0OAMuVglVGxRUIPScUUHaQnPXOfFHeMITsj5NYVhRyTH5Y-z5B59Cvtw0b6ncDVM3WMpQvrTYLJnjGq6fJNt97WCAuWFOGwdSySPrv2R9NkuA3ekEWv40gf68rkGao1PEReBZUV8wa3QhgkfaJuqVYmjTmaMN4Wrz5icowA4K3303f9tawp8CUxg'
    case 'electronics':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJh3ehcq0B6ONNBQkl4eOVQPIVbMwmFd432Klcncer-NjdfoIPWVYOwnlj8wsS8KzocJwRPyRYcdKobCTKknITw70KXsG9P_H54c26RRRTzbuiFykPSq0KcQ3VaxtWYJ3BJt9Rabcnsl5OZuKRYDqkiGnRlZYx4Yp1tQGTCteJXWDIrYmiV5AxpAB7gcZLwjRspxa_kwLI1Jb8mlCKz-UqKyAhgsLqMCh2qha6vMPGMyZ7UF49L6zxebBP3tU1CcuVjxouQoRH2kU'
    case 'electrical':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBauobEMw54ql_bZaJj0KgmK7mJs-aO9AjoRYINScZMwFFr6F0yA2Qo1wKmtjNj_qS8nl4K9D-Fei3PiBGcvnSi8O5oTev8RhEQwvXX1SauNHOyKgpv6VkY6FmJqWAzXVfEZQ2UDjX3K-ZkdbqOX1saJMERN-9hUu3J2NCMVDvxWZn_IyARueGV5BhxIANHfL_fpvE2IYQ3E9B4F4dk-asu5d30CitNXLvqy8le-NAiKJTJxlCWAkAL-H_-oDTxsQ9dV9sV8s9r8dI'
    default:
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1zwIvsJyShDXvkg2QuS4UK5aYqA1iiqrI-7niuVokAGGrQHy5JXL8vik3aFIxUUZooV8HefabiK4k7ScvvoHIgU6ke03zenNNdzfj7dlrgF50MwVIzUbDHDDpGp7pegfzqrAob-hFOdrS-5vJ7I2msyXrxgMUK3UY-2KDAmPOUb1zaAgNmn-llePQsw7kwLZRHqWp8bfmv_DjSQrZ1jVrGTr0yqg3JFsKJUM73JYP_fF-2dxiEMB8PMZa_N9wuj0IgbovtGegz58'
  }
}
