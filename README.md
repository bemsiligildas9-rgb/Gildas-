# Entraide Bac CI — By Gildas

*Réussir le Bac, ensemble !* — Plateforme éducative pour les élèves de Côte d'Ivoire (BEPC et Baccalauréat).
Créateur et propriétaire : Gildas Bemsili.

**État : les 7 étapes sont livrées.** Pour mettre le site en ligne, suis [DEPLOIEMENT.md](./DEPLOIEMENT.md) (Supabase, GitHub, Vercel, domaine entraidebacci.com, sauvegardes). Ce dossier contient la structure du projet, le thème (clair/sombre),
le logo, la connexion à Supabase, la protection des routes et le schéma complet de la base de données avec ses règles de sécurité.
La page d'accueil actuelle est provisoire ; les sections arrivent aux étapes suivantes.

## Prérequis
- Node.js 20 ou plus récent
- Un compte gratuit sur https://supabase.com

## Installation
1. Installer les dépendances : `npm install`
2. Créer un projet Supabase (région la plus proche, par exemple Europe).
3. Dans Supabase > **SQL Editor**, exécuter dans l'ordre :
   1. le contenu de `supabase/migrations/0001_schema.sql`
   2. le contenu de `supabase/migrations/0002_quiz_securise.sql`
   3. le contenu de `supabase/migrations/0003_communaute_contact.sql`
   4. le contenu de `supabase/seed.sql`
4. Copier `.env.example` en `.env.local` et remplir les valeurs (Supabase > **Project Settings > API**) :
   `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Lancer : `npm run dev` puis ouvrir http://localhost:3000

## Devenir administrateur
Les droits administrateur ne s'obtiennent **jamais** depuis le site ni depuis le profil : la table `user_roles`
n'a aucune politique d'écriture pour les utilisateurs. Après avoir créé ton compte (étape 2), exécute dans le SQL Editor :

```sql
update public.user_roles set role = 'admin'
where user_id = (select id from auth.users where email = 'TON-EMAIL');
```

## Espace administrateur (`/admin`)
Réservé aux comptes dont le rôle est `admin` (vérifié par la base de données à chaque page et à chaque action).
Un élève qui ouvre `/admin` obtient une page 404.

Depuis l'espace admin, sans toucher au code, tu peux :
- ajouter, modifier, masquer, programmer (date de publication future) et supprimer cours, exercices, corrigés, annales, fiches et vidéos, avec envoi du fichier (50 Mo maximum) ;
- créer et modifier les quiz (questions, bonnes réponses, explications) ;
- ajouter des matières, des classes et des chapitres du programme ;
- publier des annonces (affichées en haut de l'accueil) ;
- renseigner l'e-mail de contact, WhatsApp, Facebook, TikTok et Instagram ;
- consulter les statistiques et gérer les comptes (nommer ou retirer un administrateur, supprimer un compte).

La gestion des comptes demande la variable `SUPABASE_SERVICE_ROLE_KEY` (secrète, jamais dans le navigateur) :
dans `.env.local` en local, et dans les variables d'environnement de Vercel en production.

Les fichiers sont envoyés directement à Supabase Storage depuis le navigateur de l'administrateur (la RLS vérifie son rôle),
ce qui évite la limite de taille des requêtes de Vercel.

## Communauté, modération et contact
- Les élèves publient des questions et des méthodes, répondent, réagissent (« Utile ») et signalent un contenu. Seuls le prénom et l'initiale du nom sont visibles.
- Garde-fous : filtre automatique (insultes, liens en excès, majuscules, répétitions) dans `src/lib/moderation.ts` (liste à compléter par tes soins),
  limites SQL (10 publications et 30 commentaires par heure et par élève), signalements, et page `/admin/moderation` pour masquer, rétablir ou supprimer.
  L'auteur est prévenu par notification quand son contenu est masqué ou supprimé. Rien ne détecte automatiquement les fausses informations : elles passent par les signalements.
- Le formulaire de contact enregistre les messages dans la base (lecture dans `/admin/messages`) avec un champ piège anti-robots et une limite d'inondation.
  Il n'envoie **pas** d'e-mail : pour être alerté par e-mail, il faudrait brancher un service d'envoi (par exemple Resend, avec une clé API) ou un webhook Supabase.
- La vue `public_profiles` expose uniquement le nom d'affichage. Supabase peut la signaler dans ses « Security Advisors » : c'est volontaire.
- Les notifications actuelles sont : réponse à ta publication, contenu masqué ou supprimé par la modération.

## Pages légales : à faire relire
Les conditions d'utilisation et la politique de confidentialité sont rédigées d'après le fonctionnement réel du site (données collectées, prestataires Supabase et Vercel,
aucun outil de suivi). Elles ne remplacent pas un avis juridique : fais-les relire par un professionnel avant la mise en ligne, et mets-les à jour si tu changes de prestataire
ou si tu ajoutes des outils (statistiques d'audience, publicité…).

## Référencement
Titres et descriptions propres à chaque page, URL lisibles, `sitemap.xml` et `robots.txt` générés automatiquement (domaine défini par `NEXT_PUBLIC_SITE_URL`),
image de partage Open Graph, icône du site et données structurées (FAQ, organisation). Une fois le domaine actif, ajoute-le à Google Search Console
et envoie `https://entraidebacci.com/sitemap.xml`.


## Sécurité (déjà en place)
- RLS activée sur toutes les tables ; lecture/écriture limitées par utilisateur ou par rôle admin (`public.is_admin()`).
- Bucket de stockage `documents` **privé** : lecture réservée aux connectés, écriture réservée à l'admin.
- Les mots de passe sont gérés et hachés par Supabase Auth (jamais stockés par le site).
- En-têtes de sécurité HTTP (HSTS, anti-iframe, etc.) dans `next.config.mjs`.
- La clé `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais être exposée au navigateur.
- Limitation des tentatives de connexion : Supabase > **Authentication > Rate Limits** (réglage à vérifier avant la mise en ligne).
- Sauvegardes : activées par Supabase selon ton offre ; pour le plan gratuit, prévoir un export régulier (`supabase db dump`).

## Quiz : sécurité et test
Les bonnes réponses sont dans une table réservée à l'admin (`quiz_answer_keys`) et la correction est faite par la fonction
SQL `submit_quiz_attempt` : l'élève ne reçoit les réponses qu'après avoir validé, et ne peut pas écrire un faux score.
Une question est juste si les cases cochées correspondent exactement aux bonnes réponses.

En attendant le formulaire admin (étape 5), voici un quiz de test à coller dans le SQL Editor (à supprimer ensuite) :

```sql
with q as (
  insert into public.quizzes (title, description, subject_id, is_published)
  values ('Quiz de démonstration', 'Pour tester le système de quiz.',
          (select id from public.subjects where slug = 'mathematiques'), true)
  returning id
), q1 as (
  insert into public.quiz_questions (quiz_id, position, prompt, choices, multiple)
  select id, 1, 'Combien font 7 × 8 ?', '["54","56","64"]'::jsonb, false from q returning id
), k1 as (
  insert into public.quiz_answer_keys (question_id, correct_indexes, explanation)
  select id, '{1}', '7 × 8 = 56.' from q1
), q2 as (
  insert into public.quiz_questions (quiz_id, position, prompt, choices, multiple)
  select id, 2, 'Quels nombres sont premiers ?', '["2","9","11","15"]'::jsonb, true from q returning id
), k2 as (
  insert into public.quiz_answer_keys (question_id, correct_indexes, explanation)
  select id, '{0,2}', '9 = 3 × 3 et 15 = 3 × 5 ne sont pas premiers.' from q2
)
select 'ok';
```

## Feuille de route
1. Fondations — fait
2. Authentification, accueil, navigation, tableau de bord élève — fait
3. Matières, bibliothèque de documents, annales, recherche — fait
4. Quiz et progression — fait
5. Espace administrateur — fait
6. Communauté, contact, pages légales, référencement — fait
7. Déploiement, domaine, sauvegardes, relecture — fait (voir `DEPLOIEMENT.md`)

## Limites connues
- Le code a été écrit sans pouvoir être compilé ni exécuté : lance `npm run typecheck` et `npm run build` avant tout, et corrige ou fais-moi corriger les éventuelles erreurs.
- Le formulaire de contact enregistre les messages en base mais n'envoie pas d'e-mail (il faudrait un service d'envoi avec clé API).
- Les quiz sont des QCM (une ou plusieurs bonnes réponses) ; les vidéos sont des liens (YouTube intégré), pas un hébergement vidéo.
- Aucune politique de sécurité de contenu (CSP) n'est définie : à ajouter si tu veux durcir le site.
- Les pages légales sont à faire relire par un juriste.
