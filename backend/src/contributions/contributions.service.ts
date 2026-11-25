import { Injectable } from '@nestjs/common';
import { calculateContributionFee } from './contribution-fee.util';

@Injectable()
export class ContributionsService {
  preview(amount: string) {
    return calculateContributionFee(amount);
  }
}
