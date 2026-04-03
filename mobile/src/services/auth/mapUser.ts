import type { User } from '@/types';
import type { UserResponseDto } from '@/services/api/types';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop';

function tierFromDto(t: UserResponseDto['membershipTier']): User['membershipTier'] {
  switch (t) {
    case 'GOLD':
      return 'gold';
    case 'PLATINUM':
      return 'platinum';
    default:
      return 'standard';
  }
}

function langFromDto(l: UserResponseDto['preferredLanguage']): User['preferredLanguage'] {
  return l === 'AR' ? 'ar' : 'en';
}

/** Maps backend `/me` / auth user to the app `User` shape used across screens. */
export function mapUserResponseToUser(dto: UserResponseDto): User {
  return {
    id: dto.id,
    name: dto.fullName || `${dto.firstName} ${dto.lastName}`.trim(),
    nameAr: dto.nameAr ?? undefined,
    email: dto.email,
    phone: dto.phone,
    avatarUrl: dto.avatarUrl && dto.avatarUrl.length > 0 ? dto.avatarUrl : DEFAULT_AVATAR,
    cityId: dto.cityId != null ? String(dto.cityId) : '',
    membershipTier: tierFromDto(dto.membershipTier),
    walletBalance: typeof dto.walletBalance === 'number' ? dto.walletBalance : Number(dto.walletBalance),
    preferredLanguage: langFromDto(dto.preferredLanguage),
  };
}
