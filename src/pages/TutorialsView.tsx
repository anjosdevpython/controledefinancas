import React, { useEffect } from 'react';
import {
  BookOpen,
  Wallet,
  Target,
  Sparkles,
  FileText,
  PlusCircle,
  ScanLine,
  Play
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export default function TutorialsView() {

  const startTour = () => {
    const isMobile = window.innerWidth < 768;
    const addBtnSelector = isMobile ? '#mobile-add-transaction' : '#sidebar-add-transaction';
    const goalsSelector = isMobile ? '#mobile-goals' : '#sidebar-goals';

    // We navigate to home first to ensure elements are present for the tour (optional strategy)
    // But since the elements are global (Sidebar/BottomNav), we can highlight them from here.

    const driverObj = driver({
      showProgress: true,
      animate: true,
      doneBtnText: 'Concluir',
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      steps: [
        {
          element: '#sidebar-home',
          popover: {
            title: 'Visão Geral',
            description: 'Aqui no Início você vê seu saldo, receitas e despesas do mês.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: addBtnSelector,
          popover: {
            title: 'Nova Transação',
            description: 'Clique aqui para adicionar uma Receita ou Despesa. Lembre-se, o valor é formatado automaticamente!',
            side: isMobile ? 'top' : 'right',
            align: 'start'
          }
        },
        {
          element: goalsSelector,
          popover: {
            title: 'Metas',
            description: 'Defina objetivos financeiros (ex: Viagem, Carro) e acompanhe seu progresso.',
            side: isMobile ? 'top' : 'right',
            align: 'start'
          }
        },
        {
          element: '#sidebar-tutorials',
          popover: {
            title: 'Central de Ajuda',
            description: 'Sempre que tiver dúvidas, volte aqui para ver tutoriais ou reiniciar este tour.',
            side: isMobile ? 'top' : 'right',
            align: 'start'
          }
        },
      ]
    });

    driverObj.drive();
  };

  return (
    <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Central de Ajuda</h1>
          <p className="text-muted-foreground">Aprenda a tirar o máximo proveito do Anjos Finanças.</p>
        </div>
        <Button onClick={startTour} size="lg" className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 shadow-lg animate-pulse">
          <Play className="mr-2 h-5 w-5 fill-current" />
          Iniciar Tour Interativo
        </Button>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
          <TabsTrigger value="transactions" className="gap-2 py-3">
            <Wallet className="h-4 w-4" /> Transações
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2 py-3">
            <Target className="h-4 w-4" /> Metas
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2 py-3">
            <Sparkles className="h-4 w-4" /> Inteligência Art.
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2 py-3">
            <FileText className="h-4 w-4" /> Relatórios
          </TabsTrigger>
        </TabsList>

        {/* TRANSAÇÕES */}
        <TabsContent value="transactions" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-6 w-6 text-primary" />
                Adicionando Receitas e Despesas
              </CardTitle>
              <CardDescription>O básico para manter seu controle em dia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-secondary/30 p-4 rounded-xl space-y-2">
                  <h3 className="font-bold flex items-center gap-2">1. Nova Transação</h3>
                  <p className="text-sm text-muted-foreground">
                    Clique no botão flutuante <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs mx-1">+</span> no canto inferior da tela (celular) ou no menu lateral.
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-xl space-y-2">
                  <h3 className="font-bold flex items-center gap-2">2. Digitação Inteligente</h3>
                  <p className="text-sm text-muted-foreground">
                    Ao digitar o valor, o sistema formata automaticamente para Reais.
                    <br />
                    Ex: Digite <b>100</b> para <b>R$ 1,00</b>.
                    <br />
                    Digite <b>2550</b> para <b>R$ 25,50</b>.
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-xl space-y-2">
                  <h3 className="font-bold flex items-center gap-2">3. Categorias</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecione uma categoria (ex: Alimentação, Transporte) para organizar seus gastos. Isso é crucial para os gráficos funcionarem bem.
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-xl space-y-2">
                  <h3 className="font-bold flex items-center gap-2">4. Recorrência</h3>
                  <p className="text-sm text-muted-foreground">
                    Se é uma conta fixa (ex: Aluguel), ative a opção <b>"Recorrente"</b>. O sistema lembrará dela mensalmente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* METAS */}
        <TabsContent value="goals" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Criando e Gerenciando Metas
              </CardTitle>
              <CardDescription>Defina objetivos e acompanhe seu progresso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <p>
                  As Metas ajudam você a economizar para objetivos específicos, como "Viagem", "Carro Novo" ou "Reserva de Emergência".
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li>
                    Vá até a aba <b>Metas</b> e clique em "Nova Meta".
                  </li>
                  <li>
                    Defina o <b>Valor Alvo</b> (quanto você quer juntar) e o <b>Valor Atual</b> (quanto já tem).
                  </li>
                  <li>
                    <b>Vincular Transações:</b> Ao adicionar uma nova Receita ou Despesa, você pode selecioná-la no campo "Vincular à Meta". Isso atualiza o progresso da meta automaticamente!
                  </li>
                  <li>
                    O sistema avisará quando você atingir marcos importantes (25%, 50%, 100%).
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA */}
        <TabsContent value="ai" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Inteligência Artificial & Scanner
              </CardTitle>
              <CardDescription>Deixe a tecnologia trabalhar por você.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ScanLine className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold">Scanner de Recibos</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Na tela de Nova Despesa, clique no ícone de <b>Câmera</b>. Selecione a foto de um cupom fiscal ou recibo. A IA vai ler a data, o valor e a descrição para você automaticamente!
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold">Dicas Financeiras</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Na tela inicial (Dashboard), procure pelo card <b>"Dica Financeira IA"</b>. Clique em "Nova Dica" para receber conselhos personalizados com base nos seus gastos do mês.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RELATÓRIOS */}
        <TabsContent value="reports" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Relatórios e Exportação
              </CardTitle>
              <CardDescription>Compartilhe ou guarde seus dados.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <p>
                    Você pode gerar um relatório completo em <b>PDF</b> de todas as suas movimentações.
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Acesse a aba <b>Perfil / Configurações</b>.</li>
                    <li>Clique no botão <b>Exportar Relatório PDF</b>.</li>
                    <li>O download começará automaticamente com uma tabela detalhada de receitas, despesas e saldo final.</li>
                  </ol>
                </div>
                <div className="w-full md:w-1/3 bg-muted p-6 rounded-xl text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <span className="text-xs text-muted-foreground">Exemplo de PDF gerado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mt-8 text-center">
        <h3 className="font-bold text-lg mb-2">Ainda tem dúvidas?</h3>
        <p className="text-muted-foreground text-sm">
          O Anjos Finanças está em constante evolução. Se encontrar problemas, entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
}
