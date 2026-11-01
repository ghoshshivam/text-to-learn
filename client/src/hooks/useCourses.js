import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courseApi, lessonApi, videoApi } from "../utils/api";

export const useCourses = () =>
  useQuery({
    queryKey: ["courses"],
    queryFn: courseApi.list,
  });

export const useCourse = (id) =>
  useQuery({
    queryKey: ["course", id],
    queryFn: () => courseApi.get(id),
    enabled: Boolean(id),
  });

export function useGenerateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseApi.generate,
    onSuccess: (course) => {
      qc.setQueryData(["course", course._id], course);
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export const useLesson = (lessonId) =>
  useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => lessonApi.generate(lessonId),
    enabled: Boolean(lessonId),
    staleTime: Infinity,
    retry: 0,
  });

// A video never changes for a given query, so cache it for the session
export const useVideo = (query) =>
  useQuery({
    queryKey: ["video", query],
    queryFn: () => videoApi.find(query),
    enabled: Boolean(query),
    staleTime: Infinity,
    retry: 0,
  });