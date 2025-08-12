-- TESTE: Importação de 10 comentários da planilha Comentarios_com_horarios.xlsx
-- Total de comentários: 10
-- Gerado em: 2025-08-12T00:45:43.126Z

-- Limpar comentários existentes (opcional)
-- DELETE FROM public.comments;

-- Inserir comentários de teste
INSERT INTO public.comments (id, slug, name, message, created_at, status) VALUES
('433da71c-80e6-4161-9099-a35df5cc5b9c', 'amoremcristo', 'Ana Clara', 'no AmorEmCristo enfrentei bug (PIX recusado sem motivo). tentei resolver e continua travando. O central de ajuda levou dias. Ficou aquém do que imaginei.', '2025-05-21T03:21:16.000Z', 'approved'),
('b239f07d-4ae3-48f1-8f91-843d808337c3', 'tall-people-meet', 'ana.410', 'Uso o Tall People Meet e notei problema — captcha infinito no formulário. Refiz o processo ajustar, mas falhou de novo. Depois disso, o equipe de suporte não retornou. Nada resolvido. Limpei cache e repeti o processo.', '2024-09-07T18:30:16.000Z', 'approved'),
('c33c6bd7-e10a-47f2-b5ce-6128938613e4', 'surge', 'ana.4173', 'Relato direto: no Surge enfrentei instabilidade (falha ao processar pagamento). refiz o processo resolver e continua travando. O central de ajuda demorou a responder. Ficou aquém do que imaginei. Testei em outra rede móvel.', '2025-04-30T18:20:00.999Z', 'approved'),
('e356d984-a690-4592-a061-82dd5e51a91e', 'meu-rubi', 'ana.64', 'Falando objetivamente: negaram reembolsar mesmo dentro do período em Meu Rubi causou instabilidade. Tentei passos diferentes e falhou de novo. Time de atendimento levou dias. Decepcionante.', '2025-02-24T17:10:40.000Z', 'approved'),
('65bb7e7b-7f4c-40fb-9766-56ef5b41977a', 'inner-circle', 'ana.9333', 'Uso o Inner Circle e notei bug — PIX recusado sem motivo. Busquei ajustar, mas não resolveu. Como agravante, o central de ajuda respondeu tarde. Ficou aquém do que imaginei. Reinstalei o aplicativo.', '2025-03-12T08:53:49.000Z', 'approved'),
('98ed94e9-7da0-410f-83cb-5b07f045f2b2', 'inner-circle', 'ana.9678', 'Inner Circle: perfis com comportamento repetido gerou inconsistência. Insisti consertar, porém voltou a acontecer. Equipe de suporte levou dias. Esperava mais. Atualizei o app e nada mudou.', '2024-10-14T00:07:39.999Z', 'approved'),
('9a5ce6be-7671-436a-ac2b-f806f4bbaf63', 'gamer-dating', 'ana_13', 'Relato direto: perfis com comportamento repetido em Gamer Dating causou problema. Tentei passos diferentes e não resolveu. Suporte levou dias. Nada resolvido.', '2025-01-13T16:22:26.000Z', 'approved'),
('2715ce42-650d-4b54-9b0c-9e1fc89a3b70', 'hornet', 'ana_19', 'Hornet: mensagens que param sem sentido gerou pane. Repeti os passos consertar, porém não deu certo. Help desk levou dias. Decepcionante. Atualizei o app e nada mudou.', '2025-01-06T19:25:07.000Z', 'approved'),
('7951ac6b-95ab-4886-bb3f-291c0c2e2f8e', 'military-cupid', 'ana_20', 'Falando objetivamente: no Military Cupid enfrentei problema (perfis com comportamento repetido). repeti os passos resolver e não resolveu. O help desk não retornou. Ficou aquém do que imaginei. Testei em outra rede móvel.', '2025-04-17T08:46:13.999Z', 'approved'),
('06d1dec5-ba52-455c-82bc-1c903252d3d2', 'eharmony', 'ana_2703', 'Uso o eHarmony e notei inconsistência — fotos aprovadas e depois removidas. Refiz o processo ajustar, mas continua travando. Para piorar, o central de ajuda respondeu tarde. Nada resolvido. Tentei pelo navegador também.', '2024-09-29T01:31:48.999Z', 'approved');

-- Teste concluído!
-- Total inserido: 10 comentários
-- Para importar todos os comentários, use o arquivo comments-import.sql
