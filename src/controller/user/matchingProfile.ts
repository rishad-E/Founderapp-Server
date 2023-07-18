import { RequestHandler } from "express";
import createHttpError, { InternalServerError } from "http-errors";
import userModel, { IUser } from "../../models/userModel";

export const findMatchingProfiles: RequestHandler = async (req, res, next) => {

    interface ProfileWithScore {
        profile: IUser;
        score: number;
    }

    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, 'Unauthorized user'))

        const user = await userModel.findById(userId)
        if (!user) return next(createHttpError(404, 'could not find user'))

        const query = {
            _id: {$ne: userId, $nin: user.connections}, 
            $or: [
                { isTechnical: user.cofounderTechnical },
                { haveIdea: user.cofounderHasIdea },
                { 'cofounderResponsibilities': { $in: user.responsibilities } },
                { 'responsibilities': { $in: user.cofounderResponsibilities } },
                { 'cofounderHasIdea': user.cofounderHasIdea },
                { 'interests': { $in: user.interests } },
                { 'location.country': user.location.country }
            ]
        }

        const pageSize = 20
        const page: string = req.query.page as string || '1'
        const skip: number = (parseInt(page) - 1) * pageSize
        const totalMatchingProfiles = await userModel.countDocuments(query);
        const totalPages = Math.ceil(totalMatchingProfiles / pageSize);

        const calculateCompatibilityScore = (user1: IUser, user2: IUser) => {
            // Assign weights to the different criteria
            const weights = {
                interests: 5,
                haveIdea: 5,
                responsibilities: 4,
                isTechnical: 3,
                location: 3,
            };

            // Calculate the score for each criterion
            const scoreInterests = user1.interests.filter((interest) => user2.interests.includes(interest)).length * weights.interests;
            const scoreResponsibilities = user1.cofounderResponsibilities.filter((responsibilities) => user2.responsibilities.includes(responsibilities)).length * weights.responsibilities;
            const scoreLocation = user1.locationPreference === user2.locationPreference ? weights.location : 0;
            const scoreSkills = (user1.cofounderTechnical === 1) && user2.isTechnical || (user1.cofounderTechnical === 2) && !user?.isTechnical ? weights.isTechnical : 0;
            const scoreIdea = user1.cofounderHasIdea !== user2.cofounderHasIdea ? weights.haveIdea : 0;

            // Sum up the scores to get the overall compatibility score
            const score = scoreInterests + scoreResponsibilities + scoreLocation + scoreSkills + scoreIdea;
            return score;
        }

        const quickSort = (arr: ProfileWithScore[], left: number, right: number): void => {
            if (left >= right) {
                return;
            }
            const pivotIndex = Math.floor((left + right) / 2);
            const pivotValue = arr[pivotIndex].score;
            const partitionIndex = partition(arr, left, right, pivotValue);
            quickSort(arr, left, partitionIndex - 1);
            quickSort(arr, partitionIndex, right);
        }

        const partition = (arr: ProfileWithScore[], left: number, right: number, pivotValue: number): number => {
            while (left <= right) {
                while (arr[left].score > pivotValue) {
                    left++;
                }
                while (arr[right].score < pivotValue) {
                    right--;
                }
                if (left <= right) {
                    swap(arr, left, right);
                    left++;
                    right--;
                }
            }
            return left;
        }

        const swap = (arr: ProfileWithScore[], i: number, j: number): void => {
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        const matchingProfiles = await userModel.find(query).skip(skip).limit(pageSize)
        const sortedProfiles = await Promise.all(matchingProfiles.map(async (profile) => {
            const score = calculateCompatibilityScore(user, profile);
            return { profile, score };
        })).then((profiles) => {
            quickSort(profiles, 0, profiles.length - 1);
            return profiles.map((p) => p.profile);
        });

        res.status(200).json({matchingProfiles:sortedProfiles, page, totalPages})
    } catch (error) {
        return next(InternalServerError)
    }
}