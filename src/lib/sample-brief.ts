import type { BriefInput } from "@/lib/brief-schema";

/** Preloaded example so the workbench is useful on first load and in demos. */
export const SAMPLE_BRIEF_INPUT: BriefInput = {
  productIdea:
    "Lisätään nykyiseen sähköiseen potilastietojärjestelmään yhtenäinen potilasaikajana, joka kokoaa potilaan käynnit, lääkitykset, laboratoriotulokset ja ammattilaisten kirjaukset yhteen kronologiseen näkymään.",
  targetUsers:
    "Keskisuurten avovastaanottojen perusterveydenhuollon lääkärit ja hoitajat, jotka tapaavat 20–30 potilasta päivässä ja kokoavat nyt potilaan historian 5–6 erillisestä näkymästä ennen jokaista käyntiä.",
  evidence:
    "Käyttöanalytiikan mukaan ammattilaisilta kuluu keskimäärin neljä minuuttia käyntiä kohden aiempien tulosten etsimiseen. Haastatteluissa 9 lääkäriä 12:sta kertoi hajanaisten tietojen johtavan jo vastattujen kysymysten toistamiseen. Turvallisuuskatselmuksissa kaksi läheltä piti -lääkitysvirhettä yhdistettiin puutteellisesti havaittuun potilashistoriaan.",
  constraints:
    "Ratkaisun on täytettävä GDPR-vaatimukset ja roolipohjaisen käyttöoikeuksien hallinnan vaatimukset, integroiduttava nykyiseen FHIR-pohjaiseen potilastietojärjestelmään ja laboratoriotietovirtoihin, ylläpidettävä auditoitavaa käyttölokia ja valmistuttava ensimmäisen version osalta kahden vuosineljänneksen kuluessa.",
};
