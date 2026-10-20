# Mise en ligne d'Entraide Bac CI — By Gildas

Ce guide te mène de ton ordinateur jusqu'à `https://entraidebacci.com`. Suis les étapes dans l'ordre.

> **Important : ce code n'a jamais été compilé avant ta première installation.**
> Il a été écrit et relu sans accès à Internet. Au premier lancement, exécute `npm run typecheck` puis `npm run build`.
> Si un message d'erreur apparaît, copie-le tel quel et envoie-le moi : ce sont généralement de petites corrections.

---

## 1. Préparer ton ordinateur
1. Installe **Node.js 20 ou plus récent** (https://nodejs.org) et **Git** (https://git-scm.com).
2. Décompresse l'archive du projet, ouvre un terminal dans le dossier, puis :
   ```bash
   npm install
   ```

## 2. Créer le projet Supabase
1. Crée un compte sur https://supabase.com puis **New project** (choisis une région proche, par exemple Europe).
2. **SQL Editor** : exécute, dans cet ordre, le contenu complet de :
   1. `supabase/migrations/0001_schema.sql`
   2. `supabase/migrations/0002_quiz_securise.sql`
   3. `supabase/migrations/0003_communaute_contact.sql`
   4. `supabase/seed.sql`
3. **Project Settings > API** : note l'URL du projet, la clé `anon` (publique) et la clé `service_role` (**secrète**).
4. Copie `.env.example` en `.env.local` et remplis :
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...        # secrète, jamais publique
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
5. **Storage** : vérifie que le bucket `documents` existe et qu'il est **privé** (il est créé par le SQL).

### Réglages d'authentification (Authentication)
- **URL Configuration** : `Site URL` = `http://localhost:3000` pour l'instant ; dans `Redirect URLs`, ajoute `http://localhost:3000/**`.
  (On ajoutera le vrai domaine à l'étape 6. Sans cela, les liens reçus par e-mail ne fonctionnent pas.)
- **Providers > Email** : garde « Confirm email » activé et fixe la longueur minimale du mot de passe à 8.
- **Rate Limits** : vérifie les limites de connexion et d'inscription (c'est ta protection contre les tentatives répétées).
- **Messages e-mail (Email Templates)** : traduis les modèles en français (confirmation, réinitialisation du mot de passe).

### E-mails : configure ton propre service d'envoi avant le lancement
L'envoi d'e-mails intégré à Supabase est limité à **2 e-mails par heure** pour tout le projet
(limite documentée par Supabase, modifiable uniquement avec ton propre SMTP) :
en production, les confirmations d'inscription et les liens « mot de passe oublié » cesseraient vite d'arriver.
Dans **Authentication > SMTP Settings**, active « Custom SMTP » avec un fournisseur d'envoi (Resend, Brevo, Mailgun, SendGrid…),
avec une adresse expéditrice de ton domaine une fois celui-ci acheté. Teste ensuite une inscription réelle.

## 3. Tester en local
```bash
npm run typecheck
npm run build
npm run dev
```
Ouvre http://localhost:3000 puis :
1. Crée ton compte (page Inscription) et confirme l'e-mail.
2. Deviens administrateur : dans le **SQL Editor** (remplace l'e-mail) :
   ```sql
   update public.user_roles set role = 'admin'
   where user_id = (select id from auth.users where email = 'TON-EMAIL');
   ```
3. Reconnecte-toi : le bouton **Administration** apparaît. Dans `/admin/reglages`, renseigne tes contacts (e-mail, WhatsApp, réseaux sociaux).
4. Publie une ressource avec un PDF, puis vérifie qu'on peut la consulter et la télécharger.

## 4. Mettre le code sur GitHub
1. Crée un dépôt **privé** sur https://github.com.
2. Dans le dossier du projet :
   ```bash
   git init
   git add .
   git commit -m "Entraide Bac CI"
   git branch -M main
   git remote add origin https://github.com/TON-COMPTE/TON-DEPOT.git
   git push -u origin main
   ```
   Le fichier `.env.local` est ignoré par Git : tes clés ne partent pas sur GitHub. Vérifie-le avec `git status`.

## 5. Déployer sur Vercel
1. Crée un compte sur https://vercel.com, **Add New > Project**, importe ton dépôt GitHub.
2. Framework : Next.js (détecté automatiquement). Dans **Environment Variables**, ajoute les 4 variables de `.env.local`.
   Pour `NEXT_PUBLIC_SITE_URL`, mets pour l'instant l'adresse `.vercel.app` fournie, puis le vrai domaine à l'étape suivante.
3. Clique sur **Deploy**. À chaque `git push`, Vercel redéploie automatiquement.
4. Ajoute l'adresse `https://ton-projet.vercel.app/**` dans les **Redirect URLs** de Supabase pour tester en ligne.

## 6. Configurer entraidebacci.com
Le domaine n'est ni acheté ni configuré à ce stade : le site est seulement prêt à l'utiliser.

1. **Acheter** `entraidebacci.com` chez un registrar de ton choix (vérifie d'abord sa disponibilité).
2. Dans Vercel : **Project > Settings > Domains > Add**, saisis `entraidebacci.com` puis `www.entraidebacci.com`.
   Vercel affiche sur la « carte du domaine » les enregistrements exacts à créer.
3. Chez ton registrar (zone DNS), crée les enregistrements demandés par Vercel. Pour la plupart des projets
   (Vercel indique la valeur 76.76.21.21 pour le domaine racine et cname.vercel-dns-0.com pour www, en précisant que ce sont ses valeurs générales) :

   | Type  | Nom          | Valeur                                                      |
   |-------|--------------|-------------------------------------------------------------|
   | A     | `@` (racine) | `76.76.21.21`                                               |
   | CNAME | `www`        | la valeur affichée par Vercel (ex. `cname.vercel-dns-0.com`) |

   **Utilise toujours les valeurs affichées par Vercel pour ton projet** : elles peuvent différer de cet exemple.
4. Attends la propagation DNS (de quelques minutes à quelques heures). Vercel émet ensuite le certificat **HTTPS** automatiquement.
5. Choisis l'adresse principale (`entraidebacci.com`) et redirige l'autre vers elle (Domains > Edit > Redirect).
6. **Mets à jour les adresses** :
   - Vercel > Environment Variables : `NEXT_PUBLIC_SITE_URL` = `https://entraidebacci.com`, puis **Redeploy**.
   - Supabase > Authentication > URL Configuration : `Site URL` = `https://entraidebacci.com`, et `Redirect URLs` :
     `https://entraidebacci.com/**` (+ `https://www.entraidebacci.com/**`).
   - Supabase > SMTP : adresse expéditrice de ton domaine (ex. `no-reply@entraidebacci.com`), avec les enregistrements DNS que ton fournisseur d'e-mails demande (SPF/DKIM).
7. Vérifie `https://entraidebacci.com/sitemap.xml` et `https://entraidebacci.com/robots.txt`.

## 7. Check-list avant d'annoncer le site
Fais ces tests avec **deux comptes** : le tien (admin) et un compte élève de test.

- [ ] Inscription, e-mail de confirmation reçu, connexion, déconnexion.
- [ ] « Mot de passe oublié » : l'e-mail arrive et le nouveau mot de passe fonctionne.
- [ ] Le compte élève ouvre `/admin` : il obtient une page **404**.
- [ ] Publication d'un cours PDF, d'une annale (avec année et série) et d'une vidéo depuis l'admin.
- [ ] Le compte élève consulte et télécharge le PDF ; un visiteur non connecté est invité à se connecter.
- [ ] Un fichier masqué ou en brouillon n'apparaît pas pour l'élève.
- [ ] Création d'un quiz, passage par l'élève, score, explications, historique.
- [ ] Question publiée dans la communauté, réponse d'un autre compte, notification reçue, signalement visible dans `/admin/moderation`.
- [ ] Formulaire de contact : le message apparaît dans `/admin/messages`.
- [ ] Menu mobile, mode sombre et pages principales testés sur un vrai téléphone.
- [ ] Conditions d'utilisation et politique de confidentialité relues (idéalement par un juriste).
- [ ] Aucune clé secrète dans le dépôt GitHub ni dans le navigateur (seules les variables `NEXT_PUBLIC_…` sont publiques).
- [ ] Supprime les contenus de test (documents, quiz, comptes de test).

## 8. Sauvegardes
Ne te repose pas uniquement sur les sauvegardes automatiques de ton offre : vérifie ce qu'elle inclut et sa durée de conservation.

- **Base de données** (tables du site et comptes) : installe les outils PostgreSQL (`pg_dump`), récupère l'URI de connexion
  dans Supabase > Project Settings > Database, puis :
  ```bash
  DATABASE_URL="postgresql://..." ./scripts/backup.sh
  ```
- **Fichiers PDF** :
  ```bash
  npm run backup:documents
  ```
  (télécharge le bucket `documents` dans `sauvegardes/documents`). Garde aussi les originaux de tes PDF sur ton ordinateur.
- **Fréquence conseillée** : une fois par semaine, et avant chaque changement important.
- **Confidentialité** : la sauvegarde contient des données personnelles d'élèves (dont des mineurs). Stocke-la dans un espace privé et chiffré, jamais sur GitHub.
- Teste de temps en temps qu'une sauvegarde est lisible (`pg_restore --list fichier.dump`).

## 9. Après le lancement
- Ajoute le domaine à **Google Search Console** et envoie `https://entraidebacci.com/sitemap.xml`.
- Consulte chaque semaine `/admin/moderation` et `/admin/messages`.
- Les offres gratuites de Vercel et Supabase ont des limites et des conditions d'usage (notamment sur l'usage commercial et le volume) :
  lis-les sur leurs sites et passe à une offre supérieure si le trafic augmente.
- Si tu changes de prestataire ou ajoutes un outil (statistiques d'audience, publicité…), mets à jour la politique de confidentialité.

## 10. Dépannage rapide
| Problème | Piste |
|---|---|
| Le site affiche « se connecter à la base » ou des listes vides | Variables `NEXT_PUBLIC_SUPABASE_*` absentes ou fausses ; SQL non exécuté dans l'ordre. |
| L'e-mail de confirmation n'arrive pas | Limite d'envoi par défaut de Supabase : configure ton SMTP (étape 2). Regarde aussi les courriers indésirables. |
| Le lien reçu par e-mail renvoie « lien invalide » | Adresse absente des `Redirect URLs` de Supabase, ou lien déjà utilisé. |
| Impossible d'envoyer un fichier dans l'admin | Tu n'es pas administrateur (SQL de l'étape 3), fichier de plus de 50 Mo ou format non accepté. |
| La page Utilisateurs demande une clé | Ajoute `SUPABASE_SERVICE_ROLE_KEY` dans Vercel puis redéploie. |
| Le domaine reste « Invalid Configuration » | DNS non propagés ou valeurs différentes de celles de la carte Vercel ; si tout est correct, retire puis rajoute le domaine dans le projet. |
