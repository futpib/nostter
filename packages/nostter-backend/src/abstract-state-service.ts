import { UnitType } from "@prisma/client";

export abstract class AbstractStateService {
	protected abstract get _statePrismaDelegate(): any;

	async getHeight(): Promise<bigint> {
		const height = await this._statePrismaDelegate.findFirst({
			where: {
				id: UnitType.UnitValue,
			},
			select: {
				height: true,
			},
			orderBy: {
				height: 'desc',
			},
		});

		return height?.height ?? -1n;
	}

	async setHeight(height: bigint): Promise<void> {
		await this._statePrismaDelegate.upsert({
			where: {
				id: UnitType.UnitValue,
			},
			update: {
				height,
			},
			create: {
				id: UnitType.UnitValue,
				height,
			},
		});
	}
}
