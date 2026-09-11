/**
 * ── Watermark Mock Composable ──────────────────────────────
 * Fully synchronous — nothing is fetched, so there is no loading/error state
 * and no repository dependency. Wraps the shared fixture in refs so every
 * technique page (preview-1/2/3) consumes it the same way.
 */

import { formatName } from "@cdglib/js-formatify";

import { mockWatermarkImageBase64, mockWatermarkPerson } from "~/mocks/watermark.mock";

export const useWatermarkMock = () => {
  const person = ref(mockWatermarkPerson);
  const imageBase64 = ref(mockWatermarkImageBase64);

  const displayName = computed(() => {
    const currentPerson = person.value;
    return formatName.infToPrint({
      title_sex: currentPerson.title.titleSex,
      title_print: currentPerson.title.description.thai.shortPrint,
      sex: currentPerson.sex,
      fname: currentPerson.firstName,
      mname: currentPerson.middleName,
      lname: currentPerson.lastName,
    }).short;
  });

  return {
    person,
    imageBase64,
    displayName,
  };
};
